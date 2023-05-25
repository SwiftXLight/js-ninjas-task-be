import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import Hero from './entity/hero.entity';
import HeroesService from './hero.service';

@Controller('heroes')
export default class HeroesController {
  constructor(private heroesService: HeroesService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ): Promise<Hero[]> {
    return this.heroesService.findAll(page, limit);
  }

  @Get('/:id')
  async findById(@Param('id') id: number): Promise<Hero> {
    return this.heroesService.findById(id);
  }

  @Post()
  async create(@Body() hero: Hero): Promise<Hero> {
    return this.heroesService.create(hero);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() hero: Hero): Promise<Hero> {
    return this.heroesService.update(id, hero);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.heroesService.delete(id);
  }
}
