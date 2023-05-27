import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Hero from './entity/hero.entity';
import { promises as fsPromises } from 'fs';
import { IHeroResponse } from 'src/shared/interfaces';
import * as fs from 'fs-extra';
import { join } from 'path';

@Injectable()
export default class HeroesService {
  constructor(
    @InjectRepository(Hero)
    private heroesRepository: Repository<Hero>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    nickname?: string,
  ): Promise<{ data: IHeroResponse[]; totalHeroes: number }> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.heroesRepository.createQueryBuilder('hero');
      if (nickname) {
        queryBuilder.where('hero.nickname LIKE :nickname', {
          nickname: `%${nickname}%`,
        });
      }

      const [heroes, totalCount] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

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

      const directoryPath = join('uploads', String(heroId));

      await fs.remove(directoryPath);
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadHeroImages(heroId: number, imagePaths: string[]): Promise<Hero> {
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

  async appendHeroImages(heroId: number, imagePaths: string[]): Promise<Hero> {
    try {
      const hero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      hero.images = [...hero.images, ...imagePaths];
      return this.heroesRepository.save(hero);
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteHeroImage(heroId: number, filename: string): Promise<Hero> {
    try {
      const hero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      const directoryPath = `uploads/${heroId}`;
      const filePath = `${directoryPath}/${filename}`;

      await fsPromises.unlink(filePath).catch(() => {});

      hero.images = hero.images.filter((image) => image !== filePath);

      await this.heroesRepository.save(hero);

      const updatedHero = await this.heroesRepository.findOneOrFail({
        where: { id: heroId },
      });

      return updatedHero;
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
