import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import HeroesController from './hero.controller';
import HeroesService from './hero.service';
import Hero from './entity/hero.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hero]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const { originalname } = file;
          const extension: string = originalname.split('.').pop();
          const filename: string = uuidv4();

          cb(null, `${filename}.${extension}`);
        },
      }),
      limits: {
        files: 5,
      },
    }),
  ],
  controllers: [HeroesController],
  providers: [HeroesService],
})
export class HeroModule {}
