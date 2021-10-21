import axios from 'axios';
import electron from 'electron';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import StormDB from 'stormdb';
import { IBookmark, IVisitHistory } from '../../types/browsing';
import { ISettings } from '../../types/setting';

export const userDataPath = (electron.app || electron.remote.app).getPath(
  'userData'
);

export const databasePath = path.resolve(userDataPath, 'database.stormdb');

export interface SearchHistory {
  text: string;
  link: string;
}

export class Database {
  static prettier = false;

  db: StormDB;

  constructor() {
    // eslint-disable-next-line new-cap
    const engine = new StormDB.localFileEngine(databasePath);
    this.db = new StormDB(engine);
    this.db.default({
      'search-history': [],
      'visit-history': [],
      bookmark: [],
      settings: {},
    });
  }

  public Save(): boolean {
    try {
      this.db.save();
      return true;
    } catch {
      return false;
    }
  }

  public GetSettings(): ISettings {
    return this.db.get('settings').value() as ISettings;
  }

  public SetSettings(settings: ISettings): boolean {
    try {
      this.db.set('settings', settings);
      return true;
    } catch {
      return false;
    }
  }

  // #region SearchHistory
  public GetSearchHistories(): Array<SearchHistory> {
    try {
      return (
        (this.db.get('search-history').value() as Array<SearchHistory>) || []
      );
    } catch {
      return [];
    }
  }

  public AddSearchHistory(history: SearchHistory): boolean {
    try {
      this.db.get('search-history').push(history);
      return true;
    } catch {
      return false;
    }
  }

  public GetSearchHistory(index: number): SearchHistory {
    return this.db.get('search-history').get(index).value() as SearchHistory;
  }

  public SetSearchHistory(history: SearchHistory, index: number): boolean {
    try {
      this.db.get('search-history').set(index, history);
      return true;
    } catch {
      return false;
    }
  }

  public RemoveSearchHistory(index: number): boolean {
    try {
      this.db.get('search-history').get(index).delete(true);
      return true;
    } catch {
      return false;
    }
  }
  // #endregion

  // #region History
  public GetVisitHistories(): Array<IVisitHistory> {
    try {
      return (
        (this.db.get('visit-history').value() as Array<IVisitHistory>) || []
      );
    } catch {
      return [];
    }
  }

  public static async SaveVisitHistoryFavicon(
    faviconUrl: string
  ): Promise<string | null> {
    try {
      const fname = [...Array(64)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
      await axios({
        url: faviconUrl,
      }).then((x) =>
        writeFile(path.resolve(userDataPath, 'favicon', fname), x.data)
      );
      return fname;
    } catch {
      return null;
    }
  }

  public static async GetVisitHistoryFavicon(
    hexId: string
  ): Promise<Buffer | null> {
    try {
      return await readFile(path.resolve(userDataPath, 'favicon', hexId));
    } catch {
      return null;
    }
  }

  public AddVisitHistory(history: IVisitHistory): boolean {
    try {
      this.db.get('visit-history').push(history);
      return true;
    } catch {
      return false;
    }
  }

  public GetVisitHistory(id: string): IVisitHistory | undefined {
    return (this.db.get('visit-history').value() as Array<IVisitHistory>)
      .filter((x: IVisitHistory) => x.id === id)
      .shift();
  }

  public IndexVisitHistory(id: string): number {
    return (
      this.db.get('visit-history').value() as Array<IVisitHistory>
    ).findIndex((x: IVisitHistory) => x.id === id);
  }

  public SetVisitHistory(history: IVisitHistory, id: number): boolean {
    try {
      this.db.get('visit-history').set(id, history);
      return true;
    } catch {
      return false;
    }
  }

  public RemoveVisitHistory(id: string): boolean {
    try {
      this.db.get('visit-history').get(this.IndexVisitHistory(id)).delete(true);
      return true;
    } catch {
      return false;
    }
  }
  // #endregion

  // #region Bookmark
  public GetBookmarks(): Array<IBookmark> {
    return this.db.get('bookmark').value() as Array<IBookmark>;
  }

  public AddBookmark(history: IBookmark): boolean {
    try {
      this.db.get('bookmark').push(history);
      return true;
    } catch {
      return false;
    }
  }

  public GetBookmark(id: string): IBookmark | undefined {
    return (this.db.get('bookmark').value() as Array<IBookmark>)
      .filter((x: IBookmark) => x.id === id)
      .shift();
  }

  public IndexBookmark(id: string): number {
    return (this.db.get('bookmark').value() as Array<IBookmark>).findIndex(
      (x: IBookmark) => x.id === id
    );
  }

  public SetBookmark(history: IBookmark, id: number): boolean {
    try {
      this.db.get('bookmark').set(id, history);
      return true;
    } catch {
      return false;
    }
  }

  public RemoveBookmark(id: string): boolean {
    try {
      this.db.get('bookmark').get(this.IndexBookmark(id)).delete(true);
      return true;
    } catch {
      return false;
    }
  }
  // #endregion
}
