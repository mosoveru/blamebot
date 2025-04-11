import { Injectable } from '@nestjs/common';
import { NotificationMaker } from '../../types';

@Injectable()
export class NotificationMakerService implements NotificationMaker {}
