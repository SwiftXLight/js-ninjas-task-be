import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import HeroesController from './hero.controller';
import HeroesService from './hero.service';
import Hero from './entity/hero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hero])],
  controllers: [HeroesController],
  providers: [HeroesService],
})
export class HeroModule {}
