import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Hero from './entity/hero.entity';
import { promises as fsPromises, constants } from 'fs';
import { IHeroResponse } from 'src/shared/interfaces';

@Injectable()
export default class HeroesService {
  constructor(
    @InjectRepository(Hero)
    private heroesRepository: Repository<Hero>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: IHeroResponse[]; totalHeroes: number }> {
    try {
      const skip = (page - 1) * limit;
      const [heroes, totalCount] = await this.heroesRepository.findAndCount({
        skip,
        take: limit,
      });

      const formattedHeroes: IHeroResponse[] = heroes.map((hero) => ({
        id: hero.id,
        nickname: hero.nickname,
        images:
          hero.images && hero.images.length > 0
            ? hero.images[0].replace(/^uploads\//, '')
            : null,
      }));

      return { data: formattedHeroes, totalHeroes: totalCount };
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(heroId: number): Promise<Hero> {
    try {
      const hero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      if (hero.images) {
        hero.images = hero.images.map((path) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, ...rest] = path.split('/');
          return rest.join('/');
        });
      }

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
