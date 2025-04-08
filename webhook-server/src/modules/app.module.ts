import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhookController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { GitServiceTypeParserService } from '../services/git-service-type-parser/git-service-type-parser.service';
import { TOKENS } from '../config/tokens';

type DataBaseType = 'postgres';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<DataBaseType>('DB_DRIVER'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('PORT'),
        username: configService.get<string>('DB_USER_LOGIN'),
        password: configService.get<string>('DB_USER_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [WebhookController],
  providers: [{ provide: TOKENS.GIT_SERVICE_PARSER, useClass: GitServiceTypeParserService }],
})
export class AppModule {}
