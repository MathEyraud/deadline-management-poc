import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'data', 'deadline-db.sqlite'),
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // Ne pas utiliser en production
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
