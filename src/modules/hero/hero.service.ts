import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Hero from './entity/hero.entity';

@Injectable()
export default class HeroesService {
  constructor(
    @InjectRepository(Hero)
    private heroesRepository: Repository<Hero>,
  ) {}

  async findAll(): Promise<Hero[]> {
    try {
      return this.heroesRepository.find();
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
      return this.heroesRepository.save(hero);
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
}
