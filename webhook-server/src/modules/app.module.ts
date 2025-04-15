import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhookController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { GitRemoteHandlersRepository } from '../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { GitLabHandlers } from '../git-remote-handlers/gitlab';
import { RemoteGitServices } from '../constants/enums';
import { ChatEntity } from '../models/chat.entity';
import { ChatModule } from './chat.module';

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
        entities: [ChatEntity],
        synchronize: false,
        retryAttempts: 10,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ChatModule,
  ],
  controllers: [WebhookController],
  providers: [
    {
      provide: GitRemoteHandlersRepository,
      useFactory: () => {
        const repository = new GitRemoteHandlersRepository();
        repository.registerHandlers(RemoteGitServices.GITLAB, GitLabHandlers);
        return repository;
      },
    },
  ],
})
export class AppModule {}
