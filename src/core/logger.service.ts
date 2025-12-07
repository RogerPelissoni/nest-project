import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileLogger extends ConsoleLogger {
  log(message: string) {
    super.log(message);
    fs.appendFileSync(
      'app.log',
      `[LOG] ${new Date().toISOString()} - ${message}\n`,
    );
  }

  error(message: string, trace?: string) {
    super.error(message, trace);
    fs.appendFileSync(
      'app.log',
      `[ERROR] ${new Date().toISOString()} - ${message}\n`,
    );
  }

  warn(message: string) {
    super.warn(message);
    fs.appendFileSync(
      'app.log',
      `[WARN] ${new Date().toISOString()} - ${message}\n`,
    );
  }
}
