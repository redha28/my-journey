import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { JourneyDatabase, JourneyItem, UserProfile } from '../types/journey';

export class StorageService {
  private static readonly DB_FILENAME = 'data.json';
  private static readonly DB_FOLDER = '.myjourney';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private getWorkspaceDbPath(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;
    const folderPath = path.join(rootPath, StorageService.DB_FOLDER);
    if (!fs.existsSync(folderPath)) {
      try {
        fs.mkdirSync(folderPath, { recursive: true });
      } catch (err) {
        console.error('Failed to create .myjourney folder:', err);
      }
    }
    return path.join(folderPath, StorageService.DB_FILENAME);
  }

  public async getDatabase(): Promise<JourneyDatabase> {
    const dbPath = this.getWorkspaceDbPath();

    if (dbPath && fs.existsSync(dbPath)) {
      try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error reading workspace database:', e);
      }
    }

    const fallbackData = this.context.globalState.get<JourneyDatabase>('myJourneyData');
    if (fallbackData && fallbackData.items) {
      return fallbackData;
    }

    const today = new Date().toISOString().split('T')[0];
    const initialDb: JourneyDatabase = {
      version: '1.0.0',
      profile: {
        name: '',
        nik: '',
        role: '',
        level: '',
        position: '',
        employeeStatus: '',
        division: '',
        department: '',
        services: '',
        defaultStartTime: '07:45:00',
        defaultEndTime: '17:15:00',
        officeLocation: '-6.1824778, 106.8300436',
        defaultPlace: 'WFH'
      },
      items: [
        {
          id: 'demo-1',
          date: today,
          jiraKey: 'MAP-102',
          title: 'Implement account linking handler and validation',
          category: 'feature',
          mrUrl: 'https://gitlab.com/pertamina/map-customer-api/-/merge_requests/45',
          branchName: 'feature/MAP-102-account-linking',
          timeSpent: '3h',
          notes: 'Added HTTP handlers, request validation, and unit tests for account linking.',
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    await this.saveDatabase(initialDb);
    return initialDb;
  }

  public async saveDatabase(database: JourneyDatabase): Promise<void> {
    const dbPath = this.getWorkspaceDbPath();
    if (dbPath) {
      try {
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf-8');
      } catch (err) {
        console.error('Error saving to workspace .myjourney/data.json:', err);
      }
    }
    await this.context.globalState.update('myJourneyData', database);
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const db = await this.getDatabase();
    db.profile = profile;
    await this.saveDatabase(db);
    return profile;
  }

  public async addItem(itemData: Omit<JourneyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<JourneyItem> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newItem: JourneyItem = {
      ...itemData,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now
    };

    db.items.unshift(newItem);
    await this.saveDatabase(db);
    return newItem;
  }

  public async updateItem(item: JourneyItem): Promise<JourneyItem> {
    const db = await this.getDatabase();
    const index = db.items.findIndex(i => i.id === item.id);
    const now = new Date().toISOString();
    if (index !== -1) {
      db.items[index] = {
        ...item,
        updatedAt: now
      };
      await this.saveDatabase(db);
      return db.items[index];
    }
    throw new Error(`Item not found.`);
  }

  public async deleteItem(id: string): Promise<boolean> {
    const db = await this.getDatabase();
    const initLen = db.items.length;
    db.items = db.items.filter(i => i.id !== id);
    if (db.items.length !== initLen) {
      await this.saveDatabase(db);
      return true;
    }
    return false;
  }
}
