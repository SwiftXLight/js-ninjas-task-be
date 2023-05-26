import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import HeroesController from './hero.controller';
import HeroesService from './hero.service';
import Hero from './entity/hero.entity';
import * as fs from 'fs-extra';
import { FileArray } from 'express-fileupload';
import { IHeroResponse } from 'src/shared/interfaces';

const mockedHero = {
  nickname: 'John Doe',
  realName: 'Is not a John Doeee',
  originDescription: 'Earth',
  superpowers: 'Is John Doe',
  catchPhrase: 'I am John Doe',
  images: ['path/to/file1.jpg', 'path/to/file2.jpg'],
  id: 1,
};

const mockedHeroShort = {
  nickname: 'John Doe',
  images: 'path/to/file1.jpg',
  id: 1,
};

describe('HeroesController', () => {
  let controller: HeroesController;
  let service: HeroesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeroesController],
      providers: [
        HeroesService,
        {
          provide: getRepositoryToken(Hero),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HeroesController>(HeroesController);
    service = module.get<HeroesService>(HeroesService);
  });

  describe('findAll', () => {
    it('should return an array of heroes', async () => {
      const result: { data: IHeroResponse[]; totalHeroes: number } = {
        data: [mockedHeroShort],
        totalHeroes: 1,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(1, 5)).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a hero', async () => {
      const heroId = 1;
      const result: Hero = mockedHero;

      jest.spyOn(service, 'findById').mockResolvedValue(result);

      expect(await controller.findById(heroId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new hero', async () => {
      const hero: Hero = mockedHero;
      const result: Hero = mockedHero;

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(hero)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a hero and return the updated hero', async () => {
      const heroId = 1;
      const heroData: Hero = mockedHero;
      const updatedHero: Hero = {
        ...heroData,
        nickname: 'Updated John Doe',
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedHero);

      const result = await controller.update(heroId, heroData);

      expect(service.update).toHaveBeenCalledWith(heroId, heroData);
      expect(result).toEqual(updatedHero);
    });
  });

  describe('delete', () => {
    it('should delete a hero', async () => {
      const heroId = 1;

      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete(heroId);

      expect(service.delete).toHaveBeenCalledWith(heroId);
    });
  });

  describe('uploadFiles', () => {
    it('should upload files and update hero images', async () => {
      const heroId = 1;
      const files = [
        { originalname: 'file1.jpg', path: 'path/to/file1.jpg' },
        { originalname: 'file2.jpg', path: 'path/to/file2.jpg' },
      ];

      const uploadedFilePaths = ['uploads/1/file1.jpg', 'uploads/1/file2.jpg'];

      jest.spyOn(fs, 'move').mockResolvedValue(undefined);
      jest
        .spyOn(service, 'updateHeroImages')
        .mockResolvedValue({ id: heroId, images: uploadedFilePaths } as Hero);

      const result = await controller.uploadFiles(files as FileArray, heroId);

      expect(fs.move).toHaveBeenCalledTimes(2);
      expect(service.updateHeroImages).toHaveBeenCalledWith(
        heroId,
        uploadedFilePaths,
      );
      expect(result).toEqual({ id: heroId, images: uploadedFilePaths } as Hero);
    });
  });
});
