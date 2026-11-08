import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';
import { Measurement, Alarm } from './models';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  // (Opcional) jsi: true, // Para performance extra, se configurado
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    Measurement, 
    Alarm,
  ],
});

export default database;
