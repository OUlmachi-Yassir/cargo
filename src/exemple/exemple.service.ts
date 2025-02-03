import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ExempleService {
  private sessionStartTime: Date | null = null;

  startSession(req: Request, res: Response) {
    const sessionCookie = req.cookies['session_start_time'];

    if (!sessionCookie) {
      this.sessionStartTime = new Date();
      res.cookie('session_start_time', this.sessionStartTime.toISOString(), {
        httpOnly: true,
        maxAge: 30 * 1000, 
      });
      console.log('Session started:', this.sessionStartTime);
    } else {
      console.log('Existing session started at:', sessionCookie);
      this.sessionStartTime = new Date(sessionCookie);
    }
  }

  checkSessionStatus(req: Request) {
    const sessionCookie = req.cookies['session_start_time'];

    if (!sessionCookie) {
      return 'Aucune session démarrée';
    }

    const sessionStartTime = new Date(sessionCookie);
    const currentTime = new Date();
    const timeValidity = (currentTime.getTime() - sessionStartTime.getTime()) / 1000;

    if (timeValidity <= 30) {
      return 'Session still valid';
    } else {
      return 'Session ended';
    }
  }
}
