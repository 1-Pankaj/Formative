import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Application, 
  Container, 
  Texture, 
  Ticker 
} from 'pixi.js';
import 'pixi.js/unsafe-eval';

import { TiledMapRenderer } from './TiledMapRenderer';
import { Camera } from './Camera';
import { Character } from './Character';
import { DeskScreen } from './DeskScreen';
import { hexToNumber, DEFAULT_CHARACTER, type OfficeCharacterName, CAST_BY_NAME } from './cast';
import { pickSoloLine } from './cafeteriaLines';
import { loadTheme, resolveThemeMap, themeTilesetUrls } from './themeLoader';
import type { Tile, Facing } from './themeRegistry';
import { AgentTranscriptStep, ThemeMode, SkillDepartment } from '../../types';
import { dispatchAgentStep } from './officeDispatcher';
import { OfficeEmployee, getProjectEmployees, CEO_EMPLOYEE } from './officeCast';
import { EmployeeSetupModal } from './EmployeeSetupModal';
import { 
  Users, 
  Settings2, 
  Activity, 
  Maximize2,
  Crown,
  Layers,
  Cpu,
  Terminal,
  Database
} from 'lucide-react';

interface OfficeFloorViewProps {
  theme: ThemeMode;
  latestStep?: AgentTranscriptStep;
  isAiStreaming?: boolean;
  layoutTheme?: 'studio' | 'office' | 'brooklyn99';
  activeSkills?: SkillDepartment[];
  onToggleSkill?: (skill: SkillDepartment) => void;
}

interface Runtime {
  character: Character;
  seatIndex: number | null;
  waitTile: Tile;
  charName: OfficeCharacterName;
  screen?: DeskScreen;
  busySince?: number;
}

function loadTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tex = Texture.from(img);
      tex.source.scaleMode = 'nearest';
      resolve(tex);
    };
    img.onerror = () => reject(new Error('Failed to load ' + url));
    img.src = url;
  });
}

export const OfficeFloorView: React.FC<OfficeFloorViewProps> = ({
  theme,
  latestStep,
  isAiStreaming = false,
  layoutTheme = 'studio',
  activeSkills = [],
  onToggleSkill
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const runtimesRef = useRef<Map<string, Runtime>>(new Map());
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [activeSpecialist, setActiveSpecialist] = useState<string>('Chief Executive Agent');
  const [activeAction, setActiveAction] = useState<string>('Standing by • Ready for commands');

  const isLight = theme === 'light';

  // Compute active employees: Always includes CEO + any enabled skills
  const employees = useMemo(() => {
    return getProjectEmployees(activeSkills);
  }, [activeSkills]);

  // Initialize Pixi.js Canvas and Studio Scene
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let mounted = true;
    const app = new Application();
    appRef.current = app;
    const runtimes = runtimesRef.current;
    runtimes.clear();

    const initScene = async () => {
      const themeConfig = await loadTheme(layoutTheme);
      if (!mounted) return;

      await app.init({
        background: isLight ? 0xEDEDF0 : 0x0E0F12,
        antialias: false,
        roundPixels: true,
        resolution: Math.max(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        width: host.clientWidth || 960,
        height: host.clientHeight || 600,
      });

      if (!mounted) {
        app.destroy(true, { children: true });
        return;
      }

      host.appendChild(app.canvas);

      // Load Tileset textures in order
      const tilesetTextures = await Promise.all(
        themeTilesetUrls(themeConfig).map(loadTexture)
      );
      if (!mounted) {
        app.destroy(true, { children: true });
        return;
      }

      const world = new Container();
      app.stage.addChild(world);

      const mapRenderer = new TiledMapRenderer(resolveThemeMap(themeConfig), tilesetTextures);
      world.addChild(mapRenderer.getContainer());
      const charLayer = mapRenderer.getCharacterContainer();

      const camera = new Camera(world);
      cameraRef.current = camera;
      camera.setMapSize(mapRenderer.width * mapRenderer.tileSize, mapRenderer.height * mapRenderer.tileSize);
      camera.setViewSize(app.screen.width, app.screen.height);
      camera.fitToScreen();

      // Spawn points
      const entrance = mapRenderer.getSpawnPoint('entrance') || { x: 16, y: 20 };

      const facingForSeat = (t: Tile): Facing => {
        if (!mapRenderer.isWalkable(t.x, t.y - 1)) return 'up';
        if (!mapRenderer.isWalkable(t.x, t.y + 1)) return 'down';
        if (!mapRenderer.isWalkable(t.x - 1, t.y)) return 'left';
        if (!mapRenderer.isWalkable(t.x + 1, t.y)) return 'right';
        return 'up';
      };

      // Spawn active employees (CEO is always present; specialists only if active)
      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        let charName: OfficeCharacterName = 'michael';
        let member = CAST_BY_NAME.michael;
        let seatTile = mapRenderer.getSpawnPoint('desk-ceo') || { x: 4, y: 6 };
        let glowColor = 0xE04418; // Formative ember glow

        if (emp.role === 'ceo') {
          charName = 'michael';
          member = CAST_BY_NAME.michael;
          seatTile = mapRenderer.getSpawnPoint('desk-ceo') || { x: 4, y: 6 };
          glowColor = 0xE04418;
        } else if (emp.role === 'frontend') {
          charName = 'jim';
          member = CAST_BY_NAME.jim;
          seatTile = mapRenderer.getSpawnPoint('pc-1') || entrance;
          glowColor = 0xF59E0B;
        } else if (emp.role === 'backend') {
          charName = 'oscar';
          member = CAST_BY_NAME.oscar;
          seatTile = mapRenderer.getSpawnPoint('pc-2') || entrance;
          glowColor = 0x10B981;
        } else if (emp.role === 'qa') {
          charName = 'dwight';
          member = CAST_BY_NAME.dwight;
          seatTile = mapRenderer.getSpawnPoint('pc-3') || entrance;
          glowColor = 0x06B6D4;
        } else if (emp.role === 'database') {
          charName = 'kevin';
          member = CAST_BY_NAME.kevin;
          seatTile = mapRenderer.getSpawnPoint('pc-4') || entrance;
          glowColor = 0xA855F7;
        }

        const frames = await themeConfig.cast.getFrames(charName);
        if (!mounted) return;

        // Spawn characters near the office entrance, then walk them smoothly to their desks
        const spawnTile = {
          x: entrance.x + (i % 3) - 1,
          y: entrance.y + Math.floor(i / 3),
        };

        const character = new Character({
          agentId: emp.id,
          displayName: emp.name,
          mapRenderer,
          frames,
          seatTile,
          seatDirection: facingForSeat(seatTile),
          spawnTile,
          glowColor,
          onClick: () => {
            camera.nudgeToward(character.getPixelPosition().x, character.getPixelPosition().y);
          }
        });

        character.show(charLayer);

        // Smooth walking arrival animation from entrance to desk
        const walkDelay = 350 + i * 400;
        setTimeout(() => {
          if (mounted) {
            character.walkToAndThen(seatTile, () => {
              character.sitAtDesk(true);
            });
          }
        }, walkDelay);

        const rt: Runtime = {
          character,
          seatIndex: emp.deskIndex,
          waitTile: entrance,
          charName
        };

        // Desk monitor overlay setup
        if (mapRenderer.gidAt('furniture-above', seatTile.x, seatTile.y - 2) === themeConfig.monitor.offTopLeftGid) {
          const top = { x: seatTile.x, y: seatTile.y - 2 };
          rt.screen = new DeskScreen(mapRenderer, top, themeConfig.monitor);
          charLayer.addChild(rt.screen.container);
        }

        runtimes.set(emp.id, rt);
      }

      // Ticker Loop
      const onTick = (ticker: Ticker) => {
        const dt = ticker.deltaMS / 1000;
        camera.update(dt);
        const zoom = world.scale.x;
        for (const rt of runtimes.values()) {
          rt.character.setBubbleZoom(zoom);
          rt.character.update(dt);
          if (rt.screen) {
            rt.screen.setOn(rt.character.isSittingAtDesk() && isAiStreaming);
          }
        }
      };
      app.ticker.add(onTick);

      // ResizeObserver
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            app.renderer?.resize(width, height);
            camera.setViewSize(width, height);
          }
        }
      });
      resizeObserver.observe(host);

      return () => {
        resizeObserver.disconnect();
      };
    };

    initScene();

    return () => {
      mounted = false;
      if (appRef.current) {
        try {
          const app = appRef.current;
          if (app.ticker) {
            app.ticker.stop();
          }
          if ((app as any)._cancelResize === undefined) {
            (app as any)._cancelResize = () => {};
          }
          app.destroy(true, { children: true });
        } catch (_) {
          // Suppress Pixi internal resize cleanup mismatch
        }
        appRef.current = null;
      }
    };
  }, [isLight, layoutTheme, employees]);

  // Handle live telemetry steps mapping to employee characters
  useEffect(() => {
    if (!latestStep) return;
    const runtimes = runtimesRef.current;
    if (runtimes.size === 0) return;

    const result = dispatchAgentStep(latestStep, employees);
    setActiveSpecialist(result.role === 'ceo' ? 'Chief Executive Agent' : `Specialist: ${result.role.toUpperCase()}`);
    setActiveAction(result.actionMessage);

    const activeRt = runtimes.get(result.activeEmployeeId) || runtimes.get('emp-ceo');
    if (activeRt) {
      if (result.thought) {
        activeRt.character.showThought(result.thought.slice(0, 50) + '...');
      } else if (result.actionMessage) {
        activeRt.character.showThought(result.actionMessage);
      }
    }
  }, [latestStep, employees]);

  // Ambient break banter (solo quips at coffee spot or desk)
  useEffect(() => {
    const interval = setInterval(() => {
      const runtimes = runtimesRef.current;
      if (runtimes.size === 0 || isAiStreaming) return;

      if (Math.random() < 0.35) {
        const rts = Array.from(runtimes.values());
        const randomRt = rts[Math.floor(Math.random() * rts.length)];
        if (randomRt && !randomRt.character.isWorking()) {
          const line = pickSoloLine(randomRt.charName, 'coffee', Math.floor(Math.random() * 50));
          randomRt.character.showThought(line);
          setTimeout(() => {
            randomRt.character.hideThought();
          }, 4500);
        }
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isAiStreaming]);

  return (
    <div className={`relative w-full h-full flex flex-col select-none overflow-hidden transition-colors ${
      isLight ? 'bg-zinc-100' : 'bg-[#09090b]'
    }`}>
      {/* Top Operations Floor Control Bar */}
      <div className={`h-12 border-b px-5 flex items-center justify-between shrink-0 z-20 transition-colors ${
        isLight 
          ? 'bg-white border-zinc-200 text-zinc-900' 
          : 'bg-[#09090b] border-[#27272a] text-zinc-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
              Operations Floor
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono ${
              isLight 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                : 'bg-[#18181c] border-[#27272a] text-zinc-400'
            }`}>
              {employees.length === 1 ? 'CEO Solo Mode' : `${employees.length} Active Agents`}
            </span>
          </div>

          <div className={`h-4 w-[1px] ${isLight ? 'bg-zinc-200' : 'bg-[#27272a]'}`} />

          {/* Active Status Display */}
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Active:</span>
            <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {activeSpecialist}
            </span>
            <span className="text-zinc-500">•</span>
            <span className={`truncate max-w-sm font-mono text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {activeAction}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Camera Reset */}
          <button
            onClick={() => cameraRef.current?.fitToScreen()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLight 
                ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800' 
                : 'bg-[#18181c] border-[#27272a] hover:bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Reset Camera to Fit"
          >
            <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Center Camera</span>
          </button>

          {/* Skill Departments / Team Button */}
          <button
            onClick={() => setIsSetupOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 shadow-sm transition-all active:scale-95"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Skills & Team ({employees.length})</span>
          </button>
        </div>
      </div>

      {/* Pixi.js Canvas Host Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative overflow-hidden bg-[#09090b]"
      />

      {/* Skill Departments & Team Setup Modal */}
      <EmployeeSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        activeSkills={activeSkills}
        onToggleSkill={(skill) => {
          if (onToggleSkill) {
            onToggleSkill(skill);
          }
        }}
        theme={theme}
      />
    </div>
  );
};
