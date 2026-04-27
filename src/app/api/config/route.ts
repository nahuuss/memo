import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Usamos una ruta absoluta más robusta
const configPath = path.join(process.cwd(), 'src/data/config.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    console.error("Config GET Error:", error);
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Saving config to:", configPath);
    console.log("Config content:", body);
    
    // Aseguramos que el directorio exista (aunque debería existir)
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(configPath, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Config updated successfully' });
  } catch (error) {
    console.error("Config POST Error:", error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
