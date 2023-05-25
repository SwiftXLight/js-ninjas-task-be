import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Hero from './entity/hero.entity';
import IHeroResponse from 'src/shared/interfaces/getAllHeroes';
import { promises as fsPromises, constants } from 'fs';

@Injectable()
export default class HeroesService {
  constructor(
    @InjectRepository(Hero)
    private heroesRepository: Repository<Hero>,
  ) {}

  async findAll(page: number, limit: number): Promise<IHeroResponse[]> {
    try {
      const skip = (page - 1) * limit;
      const heroes = this.heroesRepository.find({ skip, take: limit });

      return (await heroes).map((hero) => ({
        id: hero.id,
        nickname: hero.nickname,
        images: hero.images && hero.images.length > 0 ? hero.images[0] : null,
      }));
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(heroId: number): Promise<Hero> {
    try {
      const hero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      return hero;
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(hero: Hero): Promise<Hero> {
    try {
      const createdHero = await this.heroesRepository.save(hero);

      return createdHero;
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(heroId: number, hero: Hero): Promise<Hero> {
    try {
      await this.heroesRepository.update(heroId, hero);

      return this.heroesRepository.findOne({
        where: { id: heroId },
      });
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(heroId: number): Promise<void> {
    try {
      await this.heroesRepository.delete(heroId);
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateHeroImages(heroId: number, imagePaths: string[]): Promise<Hero> {
    try {
      const hero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      const { readdir, unlink } = fsPromises;
      const directoryPath = `uploads/${heroId}`;
      const existingFiles = await readdir(directoryPath);

      const filesToDelete = existingFiles.filter((file) => {
        const filePath = `${directoryPath}/${file}`;
        return !imagePaths.includes(filePath);
      });

      for (const fileToDelete of filesToDelete) {
        const filePath = `${directoryPath}/${fileToDelete}`;
        await unlink(filePath);
      }

      hero.images = imagePaths;
      return this.heroesRepository.save(hero);
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fsPromises.access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
