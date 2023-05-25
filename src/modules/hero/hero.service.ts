import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Hero from './entity/hero.entity';
import IHeroResponse from 'src/shared/interfaces/getAllHeroes';

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
        nickname: hero.nickname,
        image: hero.images && hero.images.length > 0 ? hero.images[0] : null,
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
      hero.images = imagePaths;

      return this.heroesRepository.save(hero);
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
