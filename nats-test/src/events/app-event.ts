import { Subjects } from './subjects';

export interface AppEvent {
    subject: Subjects;
    data: any;
}
