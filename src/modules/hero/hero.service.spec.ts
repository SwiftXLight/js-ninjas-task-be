import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import HeroesService from './hero.service';
import Hero from './entity/hero.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Dirent, promises as fsPromises } from 'fs';
import { IHeroResponse } from 'src/shared/interfaces';
import * as fs from 'fs/promises';

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

describe('HeroesService', () => {
  let service: HeroesService;
  let module: TestingModule;
  let heroesRepositoryMock: any;
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;
  let findOneOrFailMock: jest.Mock;
  let saveMock: jest.Mock;
  beforeEach(async () => {
    deleteMock = jest.fn();
    findOneMock = jest.fn();
    updateMock = jest.fn();
    findOneOrFailMock = jest.fn();
    saveMock = jest.fn();

    heroesRepositoryMock = {
      delete: deleteMock,
      findOne: findOneMock,
      update: updateMock,
      findOneOrFail: findOneOrFailMock,
      save: saveMock,
    };

    module = await Test.createTestingModule({
      providers: [
        HeroesService,
        {
          provide: getRepositoryToken(Hero),
          useValue: heroesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<HeroesService>(HeroesService);
  });

  describe('findAll', () => {
    it('should return an array of heroes', async () => {
      const page = 1;
      const limit = 5;
      const result: { data: IHeroResponse[]; totalHeroes: number } = {
        data: [mockedHeroShort],
        totalHeroes: 1,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await service.findAll(page, limit)).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a hero', async () => {
      const heroId = 1;
      const result: Hero = mockedHero;

      jest.spyOn(service, 'findById').mockResolvedValue(result);

      expect(await service.findById(heroId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new hero', async () => {
      const hero: Hero = mockedHero;
      const result: Hero = mockedHero;

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await service.create(hero)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete a hero', async () => {
      const heroId = 1;

      await service.delete(heroId);

      expect(deleteMock).toHaveBeenCalledWith(heroId);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const heroId = 1;
      const error = new Error('Database error');

      deleteMock.mockRejectedValue(error);

      await expect(service.delete(heroId)).rejects.toThrowError(
        new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR),
      );
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

      findOneMock.mockResolvedValue(updatedHero);

      await service.update(heroId, updatedHero);

      expect(updateMock).toHaveBeenCalledWith(heroId, updatedHero);
      expect(findOneMock).toHaveBeenCalledWith({ where: { id: heroId } });
    });

    it('should throw an HttpException when an error occurs', async () => {
      const heroId = 1;
      const heroData: Hero = mockedHero;
      const updatedHero: Hero = {
        ...heroData,
        nickname: 'Updated John Doe',
      };

      const error = new Error('Database error');
      findOneMock.mockRejectedValue(error);

      await expect(service.update(heroId, updatedHero)).rejects.toThrow(Error);

      expect(updateMock).toHaveBeenCalledWith(heroId, updatedHero);
      expect(findOneMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateHeroImages', () => {
    it('should update hero images and delete unused files', async () => {
      const heroId = 1;
      const imagePaths = ['uploads/1/image1.jpg', 'uploads/1/image2.jpg'];
      const existingFiles: string[] = [
        'image1.jpg',
        'image2.jpg',
        'image3.jpg',
        'image4.jpg',
      ];

      jest.spyOn(heroesRepositoryMock, 'findOneOrFail').mockResolvedValueOnce({
        id: heroId,
        images: existingFiles,
      } as Hero);

      const readdirMock = jest
        .spyOn(fsPromises, 'readdir')
        .mockResolvedValue(existingFiles as unknown as Dirent[]);

      const unlinkMock = jest.spyOn(fsPromises, 'unlink').mockResolvedValue();

      const updatedHero = {
        id: heroId,
        images: imagePaths,
      } as Hero;
      heroesRepositoryMock.save = jest.fn().mockResolvedValueOnce(updatedHero);

      const unusedFiles = existingFiles.filter(
        (file) => !imagePaths.includes(`uploads/${heroId}/${file}`),
      );

      const result = await service.uploadHeroImages(heroId, imagePaths);

      expect(heroesRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
        where: { id: heroId },
      });
      expect(readdirMock).toHaveBeenCalledWith(`uploads/${heroId}`);
      unusedFiles.forEach((file) => {
        expect(unlinkMock).toHaveBeenCalledWith(`uploads/${heroId}/${file}`);
      });
      expect(unlinkMock).toHaveBeenCalledTimes(unusedFiles.length);
      expect(heroesRepositoryMock.save).toHaveBeenCalledWith(updatedHero);
      expect(result).toBe(updatedHero);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const heroId = 1;
      const imagePaths = ['uploads/1/image1.jpg'];

      const error = new Error('Database error');
      jest
        .spyOn(heroesRepositoryMock, 'findOneOrFail')
        .mockRejectedValueOnce(error);

      await expect(
        service.uploadHeroImages(heroId, imagePaths),
      ).rejects.toThrowError(
        new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('appendHeroImages', () => {
    it('should append hero images and return the updated hero', async () => {
      const heroId = 1;
      const imagePaths = ['uploads/1/image1.jpg', 'uploads/1/image2.jpg'];
      const existingImages = ['path/to/file1.jpg', 'path/to/file2.jpg'];
      const updatedImages = [...existingImages, ...imagePaths];

      const hero = {
        id: heroId,
        images: existingImages,
      } as Hero;

      findOneOrFailMock.mockResolvedValue(hero);
      saveMock.mockResolvedValue(hero);

      const result = await service.appendHeroImages(heroId, imagePaths);

      expect(heroesRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
        where: { id: heroId },
      });
      expect(hero.images).toEqual(updatedImages);
      expect(heroesRepositoryMock.save).toHaveBeenCalledWith(hero);
      expect(result).toBe(hero);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const heroId = 1;
      const imagePaths = ['uploads/1/image1.jpg'];

      const error = new Error('Database error');
      findOneOrFailMock.mockRejectedValue(error);

      await expect(
        service.appendHeroImages(heroId, imagePaths),
      ).rejects.toThrowError(
        new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('deleteHeroImage', () => {
    const mockHeroId = 1;
    const mockFilename = 'image.jpg';

    it('should delete the hero image and return the updated hero', async () => {
      const mockHero = new Hero();
      mockHero.id = mockHeroId;
      mockHero.images = [`uploads/${mockHeroId}/${mockFilename}`];
      jest
        .spyOn(heroesRepositoryMock, 'findOneOrFail')
        .mockResolvedValue(mockHero);

      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

      jest.spyOn(heroesRepositoryMock, 'save').mockResolvedValue(mockHero);

      const updatedHero = await service.deleteHeroImage(
        mockHeroId,
        mockFilename,
      );

      expect(heroesRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockHeroId },
      });
      expect(fs.unlink).toHaveBeenCalledWith(
        `uploads/${mockHeroId}/${mockFilename}`,
      );
      expect(heroesRepositoryMock.save).toHaveBeenCalledWith(mockHero);
      expect(updatedHero).toEqual(mockHero);
    });

    it('should throw an internal server error if an error occurs', async () => {
      jest
        .spyOn(heroesRepositoryMock, 'findOneOrFail')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteHeroImage(mockHeroId, mockFilename),
      ).rejects.toThrowError(
        new HttpException(
          'Error: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  afterEach(async () => {
    await module.close();
  });
});
