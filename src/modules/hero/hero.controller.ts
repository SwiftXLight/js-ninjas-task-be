import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import Hero from './entity/hero.entity';
import HeroesService from './hero.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs-extra';
import { FileArray } from 'express-fileupload';
import { IHeroResponse } from 'src/shared/interfaces';
import { join } from 'path';

@Controller('heroes')
export default class HeroesController {
  constructor(private heroesService: HeroesService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ): Promise<{ data: IHeroResponse[]; totalHeroes: number }> {
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

  @Post('/:id/upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: FileArray,
    @Param('id') id: number,
  ): Promise<Hero> {
    const uploadedFilePaths: string[] = [];
    for (const file of files) {
      const filePath = `uploads/${id}/${file.originalname}`;
      await fs.move(file.path, filePath, { overwrite: true });
      uploadedFilePaths.push(filePath);
    }

    const hero = await this.heroesService.updateHeroImages(
      id,
      uploadedFilePaths,
    );
    return hero;
  }

  @Get('/:id/upload')
  async getPhoto(@Param('id') id: number): Promise<string | null> {
    const uploadDir = 'uploads';
    const dirPath = join(uploadDir, `${id}`);
    const dirExists = await fs.pathExists(dirPath);

    if (dirExists) {
      const files = await fs.readdir(dirPath);

      if (files.length > 0) {
        const firstFile = files[0];
        const filePath = join(dirPath, firstFile);
        const relativePath = filePath.replace(`${uploadDir}/`, '');
        return relativePath;
      }
    }

    return null;
  }

  @Delete('/:id/images/:filename')
  async deleteHeroImage(
    @Param('id') id: number,
    @Param('filename') filename: string,
  ): Promise<Hero> {
    return this.heroesService.deleteHeroImage(id, filename);
  }
}
