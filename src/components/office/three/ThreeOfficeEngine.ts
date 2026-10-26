// @ts-nocheck
/**
 * ThreeOfficeEngine - Formative 3D Pixel Isometric Office
 * Encapsulated Three.js simulation for Formative's procedural office scene.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { OfficeMemberProfile, ProjectOfficeTeam } from '../../../types';
import type { AgentRunStatus } from '../../../types/agentRuns';
import { MAX_OFFICE_EMPLOYEES } from '../officeCast';

export interface SelectedPerson {
  name: string;
  role: string;
  roleTitle: string;
  employeeId?: string;
  agentStatus?: AgentRunStatus;
  agentSummary?: string;
  skills: string[];
  act: string;
  mood: string;
  track: string;
  steps: number;
  coffees: number;
  energyPct: number;
  drawPortrait: (targetCanvas: HTMLCanvasElement) => void;
}

export interface OfficeStats {
  floorCount: number;
  day: number;
  mode: string;
  hour: number;
  timeStr: string;
  icon: 'sun' | 'moon' | 'sunrise';
}

export interface ThreeOfficeCallbacks {
  onSelectPerson?: (person: SelectedPerson | null) => void;
  onStatsUpdate?: (stats: OfficeStats) => void;
  onToast?: (message: string) => void;
  onRenderError?: (message: string, error?: unknown) => void;
}

export interface OfficeAgentActivity {
  employeeId: string;
  status: AgentRunStatus;
  summary: string;
}

export interface ThreeOfficeInstance {
  setHour: (hour: number) => void;
  setLive: (live: boolean) => void;
  setSpeed: (speed: number) => void;
  setTilt: (tilt: number) => void;
  setResolution: (res: number) => void;
  setEmployees: (team: ProjectOfficeTeam) => void;
  setAgentActivity: (activity: OfficeAgentActivity[]) => void;
  centerCamera: () => void;
  focusEmployee: (employeeId?: string, zoomIn?: boolean) => void;
  setCameraTrackTarget: (employeeId: string | null) => void;
  showSpeechBubble: (employeeId: string, text: string, dur?: number) => void;
  getPersonScreenCoords: (employeeId?: string) => { x: number; y: number; visible: boolean; name: string; role: string; employeeId?: string } | null;
  resize: (width?: number, height?: number) => void;
  deselect: () => void;
  destroy: () => void;
  getHour: () => number;
  getLive: () => boolean;
  getSpeed: () => number;
  getTilt: () => number;
  getResolution: () => number;
}

export function createThreeOffice(
  canvas: HTMLCanvasElement, 
  callbacks: ThreeOfficeCallbacks = {},
  initialTeam?: ProjectOfficeTeam,
): ThreeOfficeInstance {
  const e = THREE;
  const t = OrbitControls;

  let isDestroyed = false;
  let animId: number = 0;
  let postProcessingEnabled = true;
  let renderErrorReported = false;

              /* ---------- tiny utils (same spirit as the park) ---------- */
            var n = (e, t, n) => e < t ? t : e > n ? n : e
              , r = (e, t, n) => e + (t - e) * n
              , i = (e, t, r) => { let i = n((r - e) / (t - e), 0, 1); return i * i * (3 - 2 * i) }
              , a = (e = 0, t = 1) => e + Math.random() * (t - e)
              , o = (e, t) => Math.floor(a(e, t + 1))
              , s = e => e[Math.floor(Math.random() * e.length)]
              , c = Math.PI * 2;

            function l(e, t) {
                let n = Math.imul(e | 0, 374761393) + Math.imul(t | 0, 668265263) | 0;
                return n = Math.imul(n ^ n >>> 13, 1274126177),
                n ^= n >>> 16,
                (n >>> 0) / 4294967296
            }

            var u = {
                get(e, t) {
                    try { let n = localStorage.getItem(`formative.office.` + e); return n == null ? t : JSON.parse(n) } catch { return t }
                },
                set(e, t) { try { localStorage.setItem(`formative.office.` + e, JSON.stringify(t)) } catch {} }
            }
              , d = e => [parseInt(e.slice(1, 3), 16), parseInt(e.slice(3, 5), 16), parseInt(e.slice(5, 7), 16)]
              , f = (e, t) => [n(e[0] + t, 0, 255), n(e[1] + t, 0, 255), n(e[2] + t, 0, 255)];

            function p(e, t) {
                return `#` + d(e).map(e => n(Math.round(e * t), 0, 255).toString(16).padStart(2, `0`)).join(``)
            }

            function m(e, t) { let n = document.createElement(`canvas`); return n.width = e, n.height = t, n }

            function h(t, r = !1) {
                let i = new e.CanvasTexture(t);
                return i.magFilter = e.NearestFilter,
                i.minFilter = e.NearestFilter,
                i.generateMipmaps = !1,
                i.colorSpace = e.SRGBColorSpace,
                r && (i.wrapS = i.wrapT = e.RepeatWrapping),
                i
            }

            function g(e, t, n) { let r = h(e, !0); return r.repeat.set(t, n), r }

            /* paint an ImageData pixel-by-pixel via fn(x,y)->[r,g,b,(a)] */
            function _(e, t, n) {
                let r = m(e, t)
                  , i = r.getContext(`2d`)
                  , a = i.createImageData(e, t)
                  , o = a.data;
                for (let r = 0; r < t; r++)
                    for (let t = 0; t < e; t++) {
                        let i = n(t, r);
                        if (!i) continue;
                        let a = (r * e + t) * 4;
                        o[a] = i[0], o[a + 1] = i[1], o[a + 2] = i[2], o[a + 3] = i.length > 3 ? i[3] : 255
                    }
                return i.putImageData(a, 0, 0), r
            }

            function v(e, t, n, r, i, a) {
                r <= 0 || i <= 0 || (e.fillStyle = a, e.fillRect(t, n, r, i))
            }

            /* dark outline around opaque pixels (the signature sprite look) */
            function b(e, t = [38, 26, 42]) {
                let n = e.getContext(`2d`)
                  , r = e.width
                  , i = e.height
                  , a = n.getImageData(0, 0, r, i)
                  , o = a.data
                  , s = new Uint8Array(r * i);
                for (let e = 0; e < r * i; e++) s[e] = +(o[e * 4 + 3] > 0);
                for (let e = 0; e < i; e++)
                    for (let n = 0; n < r; n++) {
                        let a = e * r + n;
                        s[a] || (n > 0 && s[a - 1] || n < r - 1 && s[a + 1] || e > 0 && s[a - r] || e < i - 1 && s[a + r]) && (o[a * 4] = t[0], o[a * 4 + 1] = t[1], o[a * 4 + 2] = t[2], o[a * 4 + 3] = 255)
                    }
                return n.putImageData(a, 0, 0), e
            }

            var x = e => document.getElementById(e)
              , ee = e => `<svg class="i"><use href="#i-${e}"/></svg>`;

            /* ---------- settings ---------- */
            var S = {
                hour: 13.4,
                live: !1,
                speed: 60,
                day: 1,
                tilt: u.get(`tilt`, .4),
                res: u.get(`res`, 1)
            };

            /* ---------- renderer / scene / camera ---------- */
            var ne = canvas
              , w = new e.WebGLRenderer({ canvas: ne, antialias: !1, powerPreference: `high-performance` });
            w.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)),
            w.shadowMap.enabled = !0,
            w.shadowMap.type = e.PCFShadowMap,
            w.shadowMap.autoUpdate = !1,
            w.setClearColor(0, 0);

            const gl = w.getContext();
            const supportsFloatTargets = Boolean(
              gl.getExtension('EXT_color_buffer_float') ||
              gl.getExtension('EXT_color_buffer_half_float')
            );
            const renderTargetType = supportsFloatTargets ? e.HalfFloatType : e.UnsignedByteType;

            var T = new e.Scene;
            T.fog = new e.Fog(0x88922a, 90, 280);
            var re = 165
              , ie = new e.PerspectiveCamera(10, 1, 10, 1e3)
              , ae = new t(ie, ne);
            ae.target.set(0, .4, -1),
            ie.position.setFromSpherical(new e.Spherical(re, .96, .5)).add(ae.target),
            Object.assign(ae, {
                enableDamping: !0,
                dampingFactor: .08,
                minPolarAngle: .58,
                maxPolarAngle: 1.18,
                minAzimuthAngle: -1.35,
                maxAzimuthAngle: 1.35,
                minDistance: re / 4.6,
                /* tighter max zoom-out: the world stays bigger than the frame, so it never feels small */
                maxDistance: re * 1.12,
                rotateSpeed: .45,
                zoomSpeed: 2.4,
                screenSpacePanning: !1
            });

            var camPan = null;
            var trackedTargetPerson = null;
var oe = new e.Vector3(1, 0, 0)   /* camera right vector */
              , se = 0                          /* camera azimuth */
              , ce = re
              , le = new e.Vector3;

            function ue() {
                ae.update(),
                le.copy(ie.position).sub(ae.target),
                ae.target.x = n(ae.target.x, -30, 30),
                ae.target.z = n(ae.target.z, -42, 20),
                ae.target.y = .4,
                ie.position.copy(ae.target).add(le),
                se = Math.atan2(le.x, le.z),
                ce = le.length(),
                oe.setFromMatrixColumn(ie.matrixWorld, 0)
            }

            /* ---------- post pipeline (park-grade) ---------- */
            var de = new e.WebGLRenderTarget(1, 1, { type: renderTargetType })
              , fe = new e.WebGLRenderTarget(1, 1, { type: renderTargetType, depthBuffer: !1 })
              , pe = new e.WebGLRenderTarget(1, 1, { type: e.UnsignedByteType, depthBuffer: !1, minFilter: e.NearestFilter, magFilter: e.NearestFilter })
              , me = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`
              , he = new e.ShaderMaterial({
                depthTest: !1,
                depthWrite: !1,
                uniforms: {
                    tDiffuse: { value: null },
                    uRes: { value: new e.Vector2 },
                    uAmount: { value: .7 },
                    uFocus: { value: .5 },
                    uBand: { value: .14 }
                },
                vertexShader: me,
                fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uAmount,uFocus,uBand;varying vec2 vUv;
  void main(){float amt=smoothstep(uBand,uBand+.4,abs(vUv.y-uFocus))*uAmount;float r=amt*6.5;
    if(r<.05){gl_FragColor=texture2D(tDiffuse,vUv);return;}
    vec4 s=vec4(0.);float ws=0.;
    for(int i=-6;i<=6;i++){float fi=float(i);float w=exp(-fi*fi/16.);s+=texture2D(tDiffuse,vUv+vec2(fi*r/uRes.x,0.))*w;ws+=w;}
    gl_FragColor=s/ws;}`
            })
              , E = new e.ShaderMaterial({
                depthTest: !1,
                depthWrite: !1,
                uniforms: {
                    tDiffuse: { value: null },
                    tCloud: { value: pe.texture },
                    uCloudRes: { value: new e.Vector2 },
                    uRes: { value: new e.Vector2 },
                    uAmount: { value: .7 },
                    uFocus: { value: .5 },
                    uBand: { value: .14 },
                    uExposure: { value: 1 },
                    uFlash: { value: 0 },
                    uDim: { value: 0 },
                    uStars: { value: 0 },
                    uTime: { value: 0 },
                    uSat: { value: 1.12 },
                    uTop: { value: new e.Vector3(.3, .6, .9) },
                    uBot: { value: new e.Vector3(.8, .9, 1) },
                    uCloud: { value: .35 },
                    uPan: { value: 0 },
                    uPix: { value: 4 },
                    uCloudLit: { value: new e.Vector3(1, 1, 1) },
                    uCloudShade: { value: new e.Vector3(.8, .8, .85) }
                },
                vertexShader: me,
                fragmentShader: `uniform sampler2D tDiffuse,tCloud;uniform vec2 uRes,uCloudRes;uniform float uAmount,uFocus,uBand,uExposure,uFlash,uDim,uStars,uTime,uSat,uPix;uniform vec3 uTop,uBot;varying vec2 vUv;
  vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  vec3 toSRGB(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
  float ch(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float h12(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
  void main(){
    float amt=smoothstep(uBand,uBand+.4,abs(vUv.y-uFocus))*uAmount;float r=amt*6.5;
    vec4 s;
    if(r<.05)s=texture2D(tDiffuse,vUv);
    else{s=vec4(0.);float ws=0.;
      for(int i=-6;i<=6;i++){float fi=float(i);float w=exp(-fi*fi/16.);s+=texture2D(tDiffuse,vUv+vec2(0.,fi*r/uRes.y))*w;ws+=w;}
      s/=ws;}
    float a=clamp(s.a,0.,1.);
    vec3 col=toSRGB(aces(max(s.rgb,0.)*uExposure));
    float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,uSat);
    vec3 bg=mix(uBot,uTop,smoothstep(.05,1.,vUv.y));
    if(a<.999){
      vec4 cl=texture2D(tCloud,(floor(gl_FragCoord.xy/uPix)+.5)/uCloudRes);
      vec2 sp=floor(gl_FragCoord.xy/2.);float st=step(.9975,ch(sp));
      bg+=st*uStars*(.55+.45*sin(uTime*1.7+ch(sp+3.)*40.))*smoothstep(.25,.8,vUv.y)*(1.-cl.a);
      bg=mix(bg,cl.rgb,cl.a);
    }
    col=col+bg*(1.-a);
    vec2 q=vUv-.5;float v=dot(q,q);
    col*=1.-v*.55;
    col*=1.-uDim*(.3+v*1.1);
    col=mix(col,vec3(.9,.94,1.),uFlash*.55);
    col+=(h12(gl_FragCoord.xy+floor(fract(uTime*7.)*64.))-.5)*.022;
    gl_FragColor=vec4(col,1.);}`
            })
              , D = E.uniforms
              , ge = new e.ShaderMaterial({
                depthTest: !1,
                depthWrite: !1,
                uniforms: {
                    uCanvas: { value: new e.Vector2 },
                    uTime: D.uTime,
                    uCloud: D.uCloud,
                    uPan: D.uPan,
                    uPix: D.uPix,
                    uTop: D.uTop,
                    uBot: D.uBot,
                    uCloudLit: D.uCloudLit,
                    uCloudShade: D.uCloudShade
                },
                vertexShader: me,
                fragmentShader: `uniform vec2 uCanvas;uniform float uTime,uCloud,uPan,uPix;uniform vec3 uTop,uBot,uCloudLit,uCloudShade;
  float h1(float n){return fract(sin(n*127.1+.3)*43758.5453);}
  vec2 puff(vec2 q,float i,float w,float h){
    if(q.y<0.)return vec2(0.);float inside=0.,lite=0.;
    for(int k=0;k<5;k++){float fk=float(k),u=fk/4.-.5;
      vec2 c=vec2(u*w*.8+(h1(i*7.+fk)-.5)*w*.1,0.);
      float r=h*mix(.6,1.,h1(i*11.+fk))*(1.-abs(u)*.95);
      vec2 d=q-c;if(dot(d,d)<r*r){inside=1.;if(length(d-vec2(-r*.3,r*.42))<r*.45)lite=1.;}}
    return vec2(inside,lite);}
  const int NC=16;
  vec4 clouds(vec3 sky){
    vec2 res=uCanvas/uPix,b=floor(gl_FragCoord.xy);vec4 o=vec4(0.);
    float count=mix(4.,float(NC),uCloud);
    for(int j=0;j<NC;j++){float i=float(j);if(i>=count)break;
      float depth=(i+.5)/float(NC);
      float w=floor(mix(14.,30.,depth)*mix(.85,1.15,h1(i+1.))*mix(1.,1.3,uCloud)),h=floor(w*.34);
      float span=res.x+w*2.;
      float cx=floor(mod(h1(i+3.)*span+uTime*mix(.35,1.2,depth)+uPan*mix(12.,36.,depth),span)-w);
      float cy=floor(mix(.16,.94,h1(i+4.))*res.y);
      vec2 q=b-vec2(cx,cy);
      if(abs(q.x)>w*.62||q.y<0.||q.y>h*1.05)continue;
      vec2 sh=puff(q,i,w,h);if(sh.x<.5)continue;
      float rim=1.-puff(q+vec2(0.,1.),i,w,h).x,band=max(1.,floor(h*.24));
      vec3 base=mix(uCloudLit,uCloudShade,.4);
      vec3 c=q.y<band?uCloudShade:(q.y<band+1.&&mod(b.x+b.y,2.)<1.?uCloudShade:base);
      if(sh.y>.5)c=uCloudLit;
      if(rim>.5)c=uCloudLit*1.08+.04;
      o=vec4(mix(c,sky,(1.-depth)*.4),1.);
    }
    return o;}
  void main(){float y=(floor(gl_FragCoord.y)+.5)*uPix/uCanvas.y;gl_FragColor=clouds(mix(uBot,uTop,smoothstep(.05,1.,y)));}`
            })
              , _e = new e.Scene
              , ve = new e.OrthographicCamera(-1, 1, 1, -1, 0, 1)
              , ye = new e.Mesh(new e.PlaneGeometry(2, 2), he);
            ye.frustumCulled = !1,
            _e.add(ye);

            var be = new e.Vector2
              , xe = new e.Vector2;

            function Se(width?: number, height?: number) {
                const rect = canvas.getBoundingClientRect();
                let t = Number.isFinite(width) && width! > 0 ? width! : rect.width
                  , r = Number.isFinite(height) && height! > 0 ? height! : rect.height;
                if (t <= 0 || r <= 0) return;
                t = Math.max(1, Math.floor(t));
                r = Math.max(1, Math.floor(r));
                let i = t / r;
                w.setSize(t, r, !1);
                let a = Math.max(17, 34 / i);
                ie.aspect = i,
                ie.fov = 2 * Math.atan(a / re) * 180 / Math.PI,
                ie.updateProjectionMatrix(),
                w.getDrawingBufferSize(xe),
                be.copy(xe).multiplyScalar(n(S.res, .25, 1)).floor().max(new e.Vector2(1, 1));
                let o = S.res < 1 ? e.NearestFilter : e.LinearFilter;
                fe.texture.magFilter !== o && (fe.texture.magFilter = o, fe.dispose()),
                de.setSize(be.x, be.y),
                fe.setSize(be.x, be.y),
                he.uniforms.uRes.value.copy(xe),
                E.uniforms.uRes.value.copy(xe);
                let s = D.uPix.value = 3 * w.getPixelRatio();
                D.uCloudRes.value.set(Math.ceil(xe.x / s), Math.ceil(xe.y / s)),
                pe.setSize(D.uCloudRes.value.x, D.uCloudRes.value.y),
                ge.uniforms.uCanvas.value.copy(xe)
            }

            /* ---------- lights ---------- */
            var ut = new e.HemisphereLight(`#c4e0ff`, `#5a564a`, 1.5);
            T.add(ut);
            var N = new e.DirectionalLight(`#ffffff`, 3);
            N.castShadow = !0,
            N.shadow.mapSize.set(3072, 3072),
            Object.assign(N.shadow.camera, { left: -44, right: 44, top: 44, bottom: -44, near: 1, far: 260 }),
            N.shadow.bias = -4e-4,
            N.shadow.normalBias = .03,
            N.shadow.camera.updateProjectionMatrix(),
            N.target.position.set(0, 0, 0),
            T.add(N, N.target);

            /* ---------- warm interior lamp lights injected into materials ---------- */
            var dt = []   /* { level, th, k, halo, light } fixtures */
              , ft = {
                uLampP: { value: [] },
                uLampC: { value: [] },
                uLampOn: { value: 0 }
            };

            function pt(t, n, r, i, a, o) {
                let s = new e.Color(o)
                  , c = new e.Vector4(0, 0, 0, a);
                return ft.uLampP.value.push(new e.Vector4(t, n, r, i)),
                ft.uLampC.value.push(c),
                {
                    set(e) { c.set(s.r * e, s.g * e, s.b * e, a) }
                }
            }

            function mt(e) {
                Object.assign(e.uniforms, ft),
                e.vertexShader = e.vertexShader.replace(`#include <common>`, `#include <common>
varying vec3 vLampW,vLampN;`).replace(`#include <worldpos_vertex>`, `#include <worldpos_vertex>
vLampW=(modelMatrix*vec4(transformed,1.)).xyz;vLampN=mat3(modelMatrix)*objectNormal;`),
                e.fragmentShader = e.fragmentShader.replace(`#include <common>`, `#include <common>
#define LAMP_N ${ft.uLampP.value.length}
uniform vec4 uLampP[LAMP_N],uLampC[LAMP_N];uniform float uLampOn;varying vec3 vLampW,vLampN;`).replace(`#include <lights_fragment_end>`, `#include <lights_fragment_end>
if(uLampOn>0.){
#ifdef FLAT_SHADED
  vec3 ln=normalize(cross(dFdx(vLampW),dFdy(vLampW)));
#else
  vec3 ln=normalize(vLampN)*faceDirection;
#endif
  for(int i=0;i<LAMP_N;i++){vec3 d=uLampP[i].xyz-vLampW;float dl=length(d);
    float att=pow2(saturate(1.-pow4(dl/uLampP[i].w)))/max(pow(dl,uLampC[i].w),.01);
    reflectedLight.directDiffuse+=saturate(dot(ln,d/dl))*att*uLampC[i].rgb*BRDF_Lambert(diffuseColor.rgb);}}`)
            }
            /* ================= TEXTURES ================= */

            function Re() {  /* soft radial glow */
                let e = m(64, 64)
                  , t = e.getContext(`2d`)
                  , n = t.createRadialGradient(32, 32, 0, 32, 32, 32);
                return n.addColorStop(0, `rgba(255,255,255,1)`),
                n.addColorStop(.25, `rgba(255,255,255,.55)`),
                n.addColorStop(1, `rgba(255,255,255,0)`),
                t.fillStyle = n,
                t.fillRect(0, 0, 64, 64),
                e
            }

            var ze = new e.CanvasTexture(Re());

            /* ---- generic pixel noise surfaces ---- */

            function texWall() {  /* interior painted wall, subtle grain */
                return _(24, 24, (e, t) => {
                    let n = d(`#e9e6de`)
                      , i = Math.round((l(e, t) - .5) * 8);
                    return t < 22 ? f(n, i) : f(d(`#8b8578`), i)  /* baseboard strip at bottom */
                })
            }

            function texConcrete() {  /* exterior facade panels */
                return _(32, 32, (e, t) => {
                    let n = d(`#b7b3aa`)
                      , i = Math.round((l(e >> 2, t >> 2) - .5) * 10 + (l(e, t) - .5) * 6);
                    if (t % 16 === 0 || (e + (t >> 4) * 16) % 32 === 0) i -= 26;
                    return f(n, i)
                })
            }

            function texLeaf() {
                return _(16, 16, (e, t) => {
                    let n = l(e, t);
                    if (n > .93) return [150, 140, 128];
                    return f(d(n > .48 ? `#4f8f3c` : `#3f7a33`), Math.round((n - .5) * 18))
                })
            }

            function texLeafDark() {
                return _(16, 16, (e, t) => {
                    let n = l(e, t);
                    if (n > .93) return [150, 140, 128];
                    return f(d(n > .48 ? `#3f7a33` : `#2f6428`), Math.round((n - .5) * 18))
                })
            }

            function texBark() {
                return _(8, 16, (e, t) => f(d(`#6b4a33`), Math.round((l(e, t >> 1) - .5) * 30) - (e === 0 ? 18 : 0)))
            }

            function texFabric(col) {
                return _(16, 16, (e, t) => {
                    let n = d(col)
                      , i = ((e >> 1) + (t >> 1)) % 2 ? -8 : 4;
                    return f(n, i + Math.round((l(e, t) - .5) * 10))
                })
            }

            function texWoodDesk() {  /* light oak */
                return _(24, 24, (e, t) => {
                    let n = d(`#b98a5c`)
                      , i = (t % 6 === 0) ? -24 : (t % 6 === 3 ? 6 : 0);
                    return f(n, i + Math.round((l(e >> 1, t) - .5) * 14))
                })
            }

            function texGrass() {
                return _(16, 16, (e, t) => {
                    let n = l(e, t)
                      , i = l(e >> 1, t >> 1);
                    return f(d(i > .5 ? `#5f9f45` : `#57923f`), Math.round(n * 18 - 9))
                })
            }

            function texMonitorBack() {
                return _(16, 16, (e, t) => {
                    let n = d(`#2c3038`);
                    if (t > 3 && t < 13 && e > 2 && e < 13 && t % 3 === 1) return f(n, -18);
                    if (e === 7 && t === 14) return d(`#ffb46b`);
                    return f(n, Math.round((l(e, t) - .5) * 8))
                })
            }

            function texKeyboard() {
                return _(16, 6, (e, t) => {
                    if (e % 2 === 0 || t % 2 === 0) return f(d(`#2c3038`), -14);
                    return f(d(`#454b56`), Math.round((l(e, t) - .5) * 8))
                })
            }

            function texBooks() {
                return _(48, 12, (e, t) => {
                    if (t < 2) return f(d(`#6b4a33`), -20);
                    let n = l(e >> 2, 7);
                    return f(d([`#c8483e`, `#3e6bc8`, `#e0b040`, `#4a9a6a`, `#8a5fb0`, `#d97a4a`][Math.floor(l(e >> 2, 3) * 6)]), Math.round((n - .5) * 14))
                })
            }

            function texPinboard() {
                return _(48, 24, (e, t) => {
                    let n = f(d(`#c8a878`), Math.round((l(e >> 1, t >> 1) - .5) * 14));
                    if (e > 6 && e < 14 && t > 4 && t < 10) return e + t & 1 ? f(d(`#f4f0e0`), -6) : n;
                    if (e > 24 && e < 32 && t > 12 && t < 18) return e % 3 & 1 ? f(d(`#8fd6c4`), 10) : n;
                    if (e > 38 && e < 45 && t > 3 && t < 9) return f(d(`#ffb46b`), 6);
                    return n
                })
            }

            function texWhiteboard() {
                let t = m(48, 24)
                  , n = t.getContext(`2d`);
                n.fillStyle = `#f4f2ea`,
                n.fillRect(0, 0, 48, 24),
                n.fillStyle = `#d8d4cc`,
                n.fillRect(0, 0, 48, 1),
                n.fillRect(0, 23, 48, 1);
                let cols = [`#e2452f`, `#2f6bd8`, `#e0a030`];
                for (let r = 0; r < 3; r++) {
                    let i = l(r, 11) * 30 + 6;
                    n.fillStyle = cols[r],
                    n.fillRect(6, 5 + r * 6, 30 - i + 4, 2);
                    n.fillStyle = `#2a2a30`,
                    n.fillRect(40, 4 + r * 6, 3, 4)
                }
                n.strokeStyle = `#2f6bd8`,
                n.lineWidth = 1,
                n.strokeRect(5.5, 14.5, 8, 6),
                n.strokeStyle = `#e2452f`,
                n.beginPath(),
                n.moveTo(15, 18),
                n.lineTo(22, 8),
                n.lineTo(30, 16),
                n.stroke();
                return t
            }

            function texLogo(w, hgt, bg, fg, text, px) {
                let t = m(w, hgt)
                  , n = t.getContext(`2d`);
                n.fillStyle = bg,
                n.fillRect(0, 0, w, hgt),
                n.fillStyle = fg,
                n.font = `bold ${px}px ui-monospace,Menlo,monospace`,
                n.textAlign = `center`,
                n.textBaseline = `middle`,
                n.fillText(text, w / 2, hgt / 2 + 1);
                return t
            }

            /* ---- animated canvas screens ---- */
            var animTexs = [];

            function codeScreen(theme) {
                let t = m(48, 30)
                  , n = t.getContext(`2d`)
                  , r = { bg: `#10141d`, cols: [`#7ee787`, `#79c0ff`, `#ffa657`, `#d2a8ff`, `#8b949e`], line: `#30363d` }
                  , i = { lines: [], off: 0, t: 0, iv: .3 };
                for (let e = 0; e < 46; e++)
                    i.lines.push({
                        ind: o(0, 4),
                        segs: o(2, 5),
                        col: o(0, 4),
                        empt: Math.random() < .16
                    });
                let tex = h(t);
                return animTexs.push({
                    tex, iv: .34, t: a(0, .34), upd() {
                        n.fillStyle = r.bg,
                        n.fillRect(0, 0, 48, 30),
                        n.fillStyle = `#161c26`,
                        n.fillRect(0, 0, 48, 3),
                        n.fillStyle = `#ff5f56`,
                        n.fillRect(2, 1, 1.6, 1.6),
                        n.fillStyle = `#ffbd2e`,
                        n.fillRect(5, 1, 1.6, 1.6),
                        n.fillStyle = `#27c93f`,
                        n.fillRect(8, 1, 1.6, 1.6);
                        i.off = (i.off + .24) % 46;
                        for (let row = 0; row < 13; row++) {
                            let line = i.lines[Math.floor(row + i.off) % 46];
                            if (line.empt) continue;
                            let ly = 5 + row * 1.9;
                            if (ly > 28) break;
                            n.fillStyle = `#30363d`,
                            n.fillRect(4, ly, line.ind * 5, 1.6);
                            let sx = line.ind * 5 + 6;
                            for (let sg = 0; sg < line.segs; sg++) {
                                let sw = 4 + o(4, 13);
                                if (sx + sw > 44) break;
                                n.fillStyle = r.cols[(line.col + sg) % 5],
                                n.fillRect(sx, ly, sw, 1.6),
                                sx += sw + 3
                            }
                        }
                        Math.floor(i.t * 2) % 2 < 1 && (n.fillStyle = `#7ee787`, n.fillRect(4 + o(0, 30), 5 + o(0, 20), 2, 1.6)),
                        i.t += i.iv,
                        tex.needsUpdate = !0
                    }
                }),
                tex
            }

            function dashScreen() {
                let cv = m(72, 44)
                  , cx = cv.getContext(`2d`)
                  , st = { bars: [7, 12, 9, 15, 11, 14, 8, 13], hist: [], v: 1284, t: 0, iv: .5 };
                for (let i = 0; i < 30; i++) st.hist.push(10 + a(0, 12));
                let tex = h(cv);
                return animTexs.push({
                    tex, iv: .8, t: 0, upd() {
                        st.t++,
                        st.v = Math.round(1284 + Math.sin(st.t * .05) * 60 + l(st.t, 1) * 30),
                        st.hist.push(n(10 + Math.sin(st.t * .08) * 5 + l(st.t, 2) * 9, 4, 26)),
                        st.hist.shift(),
                        st.bars = st.bars.map((e, i) => n(e + (l(st.t, i + 5) - .5) * 6, 4, 18)),
                        cx.fillStyle = `#0d1420`,
                        cx.fillRect(0, 0, 72, 44),
                        cx.fillStyle = `#ff8a5c`,
                        cx.fillRect(0, 0, 72, 7),
                        cx.fillStyle = `#fff2e0`,
                        cx.font = `bold 5px ui-monospace,monospace`,
                        cx.fillText(`BITWORKS OPS`, 3, 5),
                        cx.fillStyle = `#8fd6c4`,
                        cx.font = `bold 10px ui-monospace,monospace`,
                        cx.fillText(st.v, 3, 18),
                        cx.fillStyle = `#5a6a7a`,
                        cx.font = `4px ui-monospace,monospace`,
                        cx.fillText(`req/min`, 3, 23),
                        cx.fillText(`builds`, 40, 23),
                        cx.fillStyle = `#79c0ff`,
                        cx.font = `bold 9px ui-monospace,monospace`,
                        cx.fillText(`98.` + o(1, 9) + `%`, 40, 18);
                        for (let i = 0; i < 8; i++)
                            cx.fillStyle = i === 4 ? `#ffb46b` : `#3e6bc8`,
                            cx.fillRect(2 + i * 4, 41 - st.bars[i], 3, st.bars[i]);
                        for (let i = 0; i < 30; i++) {
                            let t2 = 44 + i * .93;
                            cx.fillStyle = `#8fd6c4`,
                            cx.fillRect(t2, 40 - st.hist[i], .8, st.hist[i])
                        }
                        cx.strokeStyle = `#2a3648`,
                        cx.strokeRect(.5, 10.5, 33, 33),
                        cx.strokeRect(38.5, 10.5, 33, 33),
                        tex.needsUpdate = !0
                    }
                }),
                tex
            }

            function tvScreen() {
                let t = m(72, 44)
                  , n = t.getContext(`2d`)
                  , r = { page: 0, t: 0, iv: .5 };
                let i = [
                    { ti: `SPRINT 42`, items: [`- ship pixel engine`, `- fix login flow`, `- migrate db`, `- team lunch!`] },
                    { ti: `Q3 ROADMAP`, items: [`- office v2`, `- ai helpers`, `- more plants`, `- coffee bot`] },
                    { ti: `RETRO BOARD`, items: [`+ shipped it`, `+ less bugs`, `- slow wifi`, `- cold coffee`] }
                ];
                let tex = h(t);
                return animTexs.push({
                    tex, iv: .5, t: 0, upd() {
                        r.t++,
                        r.t % 16 === 0 && (r.page = (r.page + 1) % 3);
                        let a = i[r.page]
                          , o = r.t % 16 < 2;
                        if (n.fillStyle = `#101820`, n.fillRect(0, 0, 72, 44), o && (n.fillStyle = `#f4f2ea`, n.fillRect(0, 0, 72, 44)),
                        !o) {
                            n.fillStyle = `#ffb46b`,
                            n.fillRect(0, 0, 72, 9),
                            n.fillStyle = `#20141c`,
                            n.font = `bold 6px ui-monospace,monospace`,
                            n.fillText(a.ti, 4, 6.5);
                            for (let e = 0; e < a.items.length; e++)
                                n.fillStyle = e % 2 ? `#8fd6c4` : `#e9e6de`,
                                n.font = `5px ui-monospace,monospace`,
                                n.fillText(a.items[e], 5, 17 + e * 6.5);
                            n.strokeStyle = `#79c0ff`,
                            n.beginPath(),
                            n.moveTo(46, 38);
                            for (let e = 0; e < 12; e++) {
                                let px = 46 + e * 2.2
                                  , py = 38 - (8 + l(r.page, e) * 12 + e);
                                n.lineTo(px, py)
                            }
                            n.stroke()
                        }
                        tex.needsUpdate = !0
                    }
                }),
                tex
            }

            function ledScreen() {
                let cv = m(12, 42)
                  , cx = cv.getContext(`2d`)
                  , st = { t: 0, iv: .18, grid: [] };
                for (let i = 0; i < 42; i++)
                    for (let j = 0; j < 12; j++)
                        st.grid.push(l(j, i) < .06 ? 1 : 0);
                let tex = h(cv);
                return animTexs.push({
                    tex, iv: .18, t: 0, upd() {
                        st.t++,
                        cx.fillStyle = `#0c0e14`,
                        cx.fillRect(0, 0, 12, 42);
                        for (let i = 0; i < 42; i++)
                            for (let j = 0; j < 12; j++) {
                                let idx = i * 12 + j
                                  , on = st.grid[idx];
                                on && l(st.t, idx) < .25 && (st.grid[idx] = 0),
                                !on && l(st.t, idx + 99) < .022 && (st.grid[idx] = 1),
                                st.grid[idx] ? (cx.fillStyle = [`#7ee787`, `#79c0ff`, `#ffa657`, `#ff6b6b`][Math.floor(l(j, i) * 4)], cx.fillRect(j, i, 1, 1)) : l(j, i) > .96 && (cx.fillStyle = `#1e242e`, cx.fillRect(j, i, 1, 1))
                            }
                        tex.needsUpdate = !0
                    }
                }),
                tex
            }

            function clockScreen() {
                let t = m(28, 12)
                  , n = t.getContext(`2d`)
                  , r = { t: 0, iv: 2 };
                let tex = h(t);
                return animTexs.push({
                    tex, iv: 2, t: 0, upd() {
                        let e = Math.floor(S.hour) % 24
                          , t = Math.floor((S.hour % 1) * 60)
                          , i = String(e).padStart(2, `0`) + (r.t % 2 < 1 ? `:` : ` `) + String(t).padStart(2, `0`);
                        n.fillStyle = `#10141d`,
                        n.fillRect(0, 0, 28, 12),
                        n.fillStyle = `#ffb46b`,
                        n.font = `bold 9px ui-monospace,monospace`,
                        n.textAlign = `center`,
                        n.fillText(i, 14, 9),
                        tex.needsUpdate = !0
                    }
                }),
                tex
            }

            /* ---- emoji speech bubble ---- */
            var En = (t => {
                let n = {};
                return r => {
                    if (n[r]) return n[r];
                    let i = m(64, 64)
                      , a = i.getContext(`2d`);
                    return a.font = `42px "Segoe UI Emoji","Apple Color Emoji",sans-serif`,
                    a.textAlign = `center`,
                    a.textBaseline = `middle`,
                    a.fillText(r, 32, 36),
                    n[r] = new e.CanvasTexture(i),
                    n[r].colorSpace = e.SRGBColorSpace,
                    n[r]
                }
            })();

            /* ---- dynamic comic speech bubble data generator ---- */
            var createSpeechBubbleData = (function() {
                let cache = new Map();
                const MAX_BUBBLE_CACHE = 48;
                let measureCanvas = m(600, 200);
                let mctx = measureCanvas.getContext('2d');

                return function(name, text) {
                    let cleanText = (text || '...').trim();
                    let safeName = name ? name.toUpperCase() : '';
                    let cacheKey = `${safeName}:${cleanText}`;
                    if (cache.has(cacheKey)) {
                        const val = cache.get(cacheKey);
                        cache.delete(cacheKey);
                        cache.set(cacheKey, val);
                        return val;
                    }

                    let fontSize = 26;
                    let font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                    mctx.font = font;

                    // Intelligent word wrap (max width ~380px)
                    let words = cleanText.split(/\s+/);
                    let lines = [];
                    let cur = '';
                    let maxLineWidthAllowed = 380;

                    for (let w of words) {
                        let testLine = cur ? `${cur} ${w}` : w;
                        if (mctx.measureText(testLine).width > maxLineWidthAllowed && cur) {
                            lines.push(cur);
                            cur = w;
                            if (lines.length === 4) break;
                        } else {
                            cur = testLine;
                        }
                    }
                    if (cur && lines.length < 4) lines.push(cur);
                    if (lines.length === 0) lines = [cleanText];

                    // Compute maximum line width
                    let maxLineW = Math.max(...lines.map(l => mctx.measureText(l).width));
                    let nameFont = `bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                    if (safeName) {
                        mctx.font = nameFont;
                        let nameW = mctx.measureText(safeName).width;
                        mctx.font = font;
                        if (nameW + 48 > maxLineW) maxLineW = nameW + 48;
                    }

                    let padX = 26;
                    let isDots = lines.length === 1 && (cleanText === '···' || cleanText === '...');
                    let bubbleW = Math.max(isDots ? 84 : 160, Math.ceil(maxLineW + padX * 2));

                    let lineHeight = 34;
                    let textBlockH = lines.length * lineHeight;
                    let padTop = safeName ? 42 : 18;
                    let padBottom = 22;
                    let bubbleH = textBlockH + padTop + padBottom;
                    let tailH = 16;

                    let canvasW = bubbleW + 20;
                    let canvasH = bubbleH + tailH + 12;

                    let cv = m(canvasW, canvasH);
                    let ctx = cv.getContext('2d');

                    // Draw comic speech bubble
                    let bx = 10, by = 8, r = 16;
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#18181c';
                    ctx.lineWidth = 5;
                    ctx.lineJoin = 'round';

                    ctx.beginPath();
                    ctx.moveTo(bx + r, by);
                    ctx.lineTo(bx + bubbleW - r, by);
                    ctx.quadraticCurveTo(bx + bubbleW, by, bx + bubbleW, by + r);
                    ctx.lineTo(bx + bubbleW, by + bubbleH - r);
                    ctx.quadraticCurveTo(bx + bubbleW, by + bubbleH, bx + bubbleW - r, by + bubbleH);

                    // Tail pointing down toward character head
                    let tx = bx + bubbleW / 2, ty = by + bubbleH;
                    ctx.lineTo(tx + 14, ty);
                    ctx.lineTo(tx, ty + tailH);
                    ctx.lineTo(tx - 14, ty);

                    ctx.lineTo(bx + r, by + bubbleH);
                    ctx.quadraticCurveTo(bx, by + bubbleH, bx, by + bubbleH - r);
                    ctx.lineTo(bx, by + r);
                    ctx.quadraticCurveTo(bx, by, bx + r, by);
                    ctx.closePath();

                    ctx.fill();
                    ctx.stroke();

                    // Name Tag Header (Crisp, bold, prominent 20px)
                    if (safeName) {
                        ctx.font = nameFont;
                        ctx.fillStyle = '#ea580c';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText(safeName, tx, by + 12);
                    }

                    // Render text lines
                    ctx.font = font;
                    ctx.fillStyle = '#09090b';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    let startY = by + padTop + lineHeight / 2 - 2;
                    lines.forEach((line, i) => {
                        ctx.fillText(line, tx, startY + i * lineHeight);
                    });

                    let tex = new e.CanvasTexture(cv);
                    tex.colorSpace = e.SRGBColorSpace;
                    tex.minFilter = e.LinearFilter;
                    tex.magFilter = e.LinearFilter;

                    // Calculate 3D world units: height is scaled so it's readable
                    let worldH = Math.max(0.62, (bubbleH + tailH) * 0.0084);
                    let worldW = worldH * (canvasW / canvasH);

                    let result = {
                        texture: tex,
                        worldW: worldW,
                        worldH: worldH,
                        canvasW: canvasW,
                        canvasH: canvasH
                    };

                    if (cache.size >= MAX_BUBBLE_CACHE) {
                        const oldestKey = cache.keys().next().value;
                        if (oldestKey) {
                            const oldestVal = cache.get(oldestKey);
                            if (oldestVal && oldestVal.texture) {
                                try { oldestVal.texture.dispose(); } catch (_) {}
                            }
                            cache.delete(oldestKey);
                        }
                    }
                    cache.set(cacheKey, result);
                    return result;
                };
            })();
            /* ================= MATERIALS / LAMPS ================= */

            var lampMats = [];

            /* pendant + fixture lamps injected as shader lights (defined FIRST, before mt) */
            var LAMPS = [];
            function Lp(x, y, z, range, falloff, color) { LAMPS.push(pt(x, y, z, range, falloff, color)) }
            Lp(-12, 2.35, -3.2, 7, 1.55, `#ffcf9a`);
            Lp(-4, 2.35, -3.2, 7, 1.55, `#ffcf9a`);
            Lp(-12, 2.35, 2.8, 7, 1.55, `#ffcf9a`);
            Lp(-4, 2.35, 2.8, 7, 1.55, `#ffcf9a`);
            Lp(9.5, 2.35, -4, 5.5, 1.5, `#ffcf9a`);
            Lp(14, 2.35, -4, 5.5, 1.5, `#ffcf9a`);
            Lp(12.8, 1.35, 5.6, 3.4, 1.35, `#ffd9a0`);
            Lp(16.3, 1.45, 8.7, 4.4, 1.4, `#ffd9a0`);
            Lp(-11.4, 1.32, 5.1, 4.2, 1.4, `#ffd9a0`);
            Lp(-6.8, 1.5, 8.3, 4.6, 1.4, `#ffd9a0`);
            Lp(-14, 1.85, -10.7, 5, 1.45, `#ffe8c8`);
            Lp(-13, 2.1, -1.5, 4.6, 1.4, `#8ab8ff`);
            Lp(-8.2, 2.05, 3.2, 3.2, 1.3, `#ffd9a0`);
            Lp(16.6, 1.4, -10.7, 4.4, 1.4, `#ffd9a0`);
            /* exterior: two plaza lamposts warm the front walk at night */
            Lp(-14, 2.8, 16.1, 5.5, 1.4, `#ffd9a0`);
            Lp(14, 2.8, 16.1, 5.5, 1.4, `#ffd9a0`);
            /* cherry-park stone lanterns + pond glow */
            Lp(-9.5, .95, -52.5, 4.6, 1.5, `#ffcf9a`);
            Lp(17.5, .95, -52.5, 4.6, 1.5, `#ffcf9a`);
            Lp(6, .95, -45, 4.2, 1.5, `#ffcf9a`);
            Lp(4, .95, -71.5, 4.6, 1.5, `#ffcf9a`);
            Lp(-.5, .95, -88.5, 4.6, 1.5, `#ffcf9a`);
            /* residential court + east parkette lamps */
            Lp(-53.5, 2.8, -47.5, 5, 1.4, `#ffd9a0`);
            Lp(60, 2.8, 4, 5, 1.4, `#ffd9a0`);

            /* shared materials */
            var M = {
                wallIn: new e.MeshStandardMaterial({ map: g(texWall(), 10, 1.5), roughness: .92 }),
                concrete: new e.MeshStandardMaterial({ map: g(texConcrete(), 8, 1), roughness: .95 }),
                cap: new e.MeshStandardMaterial({ color: `#3a3f48`, roughness: .8 }),
                frame: new e.MeshStandardMaterial({ color: `#2c313a`, roughness: .55, metalness: .35 }),
                frameLight: new e.MeshStandardMaterial({ color: `#4a5262`, roughness: .5, metalness: .3 }),
                beam: new e.MeshStandardMaterial({ color: `#343a42`, roughness: .75 }),
                glass: new e.MeshStandardMaterial({ color: `#bcd8e4`, transparent: !0, opacity: .15, roughness: .45, metalness: 0, depthWrite: !1, side: e.DoubleSide }),
                glassDoor: new e.MeshStandardMaterial({ color: `#c8e0ea`, transparent: !0, opacity: .22, roughness: .1, depthWrite: !1, side: e.DoubleSide }),
                deskTop: new e.MeshStandardMaterial({ map: g(texWoodDesk(), 2, 1), roughness: .6 }),
                deskTopW: new e.MeshStandardMaterial({ color: `#ece9e0`, roughness: .55 }),
                metal: new e.MeshStandardMaterial({ color: `#3a3f4a`, roughness: .5, metalness: .4 }),
                white: new e.MeshStandardMaterial({ color: `#e8e5dd`, roughness: .8 }),
                monBack: new e.MeshStandardMaterial({ map: h(texMonitorBack()), roughness: .7 }),
                chairFab: new e.MeshStandardMaterial({ map: g(texFabric(`#46506b`), 2, 2), roughness: .95 }),
                chairFab2: new e.MeshStandardMaterial({ map: g(texFabric(`#5c4a3e`), 2, 2), roughness: .95 }),
                sofaFab: new e.MeshStandardMaterial({ map: g(texFabric(`#4f5a6e`), 3, 2), roughness: .95 }),
                rust: new e.MeshStandardMaterial({ map: g(texFabric(`#c86a4a`), 2, 2), roughness: .95 }),
                pot: new e.MeshStandardMaterial({ color: `#b56a52`, roughness: .9 }),
                soil: new e.MeshStandardMaterial({ color: `#3a2e26`, roughness: 1 }),
                leaf: new e.MeshStandardMaterial({ map: h(texLeaf()), roughness: .95 }),
                leafDark: new e.MeshStandardMaterial({ map: h(texLeafDark()), roughness: .95 }),
                bark: new e.MeshStandardMaterial({ map: h(texBark()), roughness: 1 }),
                grassMat: new e.MeshStandardMaterial({ map: h(texGrass()), roughness: 1 }),
                rack: new e.MeshStandardMaterial({ color: `#252a34`, roughness: .6, metalness: .3 }),
                books: new e.MeshStandardMaterial({ map: g(texBooks(), 1, 1), roughness: .9 }),
                pinboard: new e.MeshStandardMaterial({ map: h(texPinboard()), roughness: .95 }),
                whiteboard: new e.MeshStandardMaterial({ map: h(texWhiteboard()), roughness: .3 }),
                keyb: new e.MeshStandardMaterial({ map: g(texKeyboard(), 1, 1), roughness: .7 })
            };
            lampMats.push(M.wallIn, M.concrete, M.deskTop, M.deskTopW, M.chairFab, M.chairFab2, M.sofaFab, M.rust, M.white, M.metal, M.beam);

            /* helper: box mesh */
            function bx(w, hgt, d, mat, x, y, z, ry = 0) {
                let t = new e.Mesh(new e.BoxGeometry(w, hgt, d), mat);
                return t.position.set(x, y, z),
                t.rotation.y = ry,
                t.castShadow = !0,
                t.receiveShadow = !0,
                t
            }

            function add(...meshes) { return meshes.forEach(t => T.add(t)), meshes }

            /* ================= GROUND (outside) ================= */

            var G = { GRASS: 1, WALK: 2, ASPH: 3, LINE: 4, ZEBRA: 5, PLAZA: 6, CURB: 7, CONC: 8 }
              , Gpal = {
                [G.GRASS]: { c: [`#5f9f45`, `#6aad4c`, `#57923f`, `#74b553`].map(d), r: 255 },
                [G.WALK]: { c: [`#bdb8b0`, `#b5b0a8`, `#c4bfb7`].map(d), r: 185 },
                [G.ASPH]: { c: [`#4b4d58`, `#474953`, `#51535e`].map(d), r: 150 },
                [G.LINE]: { c: [`#ecc94b`, `#e3c044`].map(d), r: 150 },
                [G.ZEBRA]: { c: [`#eeece6`, `#e6e3dc`].map(d), r: 150 },
                [G.PLAZA]: { c: [`#cfae86`, `#c4a37c`, `#d6b78f`].map(d), r: 200 },
                [G.CURB]: { c: [`#ddd9d0`, `#d2cec5`].map(d), r: 185 },
                [G.CONC]: { c: [`#b7b3aa`, `#aeaaa1`].map(d), r: 190 }
            };

            function groundType(x, z) {
                if (z >= 16.6 && z < 22.4) {
                    if (x > -1.3 && x < 2.3)
                        return Math.floor((z - 17.4) / 1.05) % 2 < 1 ? G.ZEBRA : G.ASPH;
                    if (Math.abs(z - 19.5) < .1 && (x + 60) % 4 < 2.4) return G.LINE;
                    return G.ASPH
                }
                if (z >= 22.4 && z < 26.2) return z < 22.7 || z > 25.9 ? G.CURB : G.WALK;
                if (z >= 26.2) return G.GRASS;
                if (z >= 11.8) {
                    if (x > -8 && x < 8 && z < 14.8) return G.PLAZA;
                    return z < 12.1 || (z > 16.2 && z < 16.6) ? G.CURB : G.WALK
                }
                if (z > -13.8 && z < 11.8 && x > -19.8 && x < 19.8) {
                    if (Math.abs(x) > 18.3 || z < -12.3 || z > 10.3) return G.CURB;
                    return G.CONC
                }
                return G.GRASS
            }

            function paintGround() {
                let t = 1152, r = 960;
                let i = m(t, r)
                  , o = i.getContext(`2d`)
                  , s = o.createImageData(t, r);
                let c = m(t, r)
                  , u = c.getContext(`2d`)
                  , dd = u.createImageData(t, r);
                for (let e = 0; e < r; e++)
                    for (let m2 = 0; m2 < t; m2++) {
                        let f = e * t + m2
                          , g2 = groundType(-36 + (m2 + .5) / 16, -34 + (e + .5) / 16)
                          , b = Gpal[g2]
                          , w = b.c[Math.floor(l(m2, e) * b.c.length)];
                        g2 === G.WALK ? w = m2 % 16 === 0 || e % 16 === 0 ? [161, 156, 148] : w
                        : g2 === G.PLAZA ? w = e % 8 === 0 ? [168, 141, 106] : (m2 + (e >> 3) * 8) % 16 === 0 ? [170, 143, 108] : w
                        : g2 === G.GRASS && l(m2, e) > .988 && (w = [135, 196, 95]);
                        let E = f * 4;
                        s.data[E] = w[0],
                        s.data[E + 1] = w[1],
                        s.data[E + 2] = w[2],
                        s.data[E + 3] = 255,
                        dd.data[E] = dd.data[E + 1] = dd.data[E + 2] = n(b.r + Math.floor((l(m2 >> 2, e >> 2) - .5) * 18), 0, 255),
                        dd.data[E + 3] = 255
                    }
                return o.putImageData(s, 0, 0),
                u.putImageData(dd, 0, 0),
                { map: h(i), rough: h(c) }
            }

            var Gt = paintGround()
              , groundMat = new e.MeshStandardMaterial({ map: Gt.map, roughnessMap: Gt.rough, roughness: 1, metalness: 0 });
            lampMats.push(groundMat);
            var ground = new e.Mesh(new e.PlaneGeometry(72, 60).rotateX(-Math.PI / 2), groundMat);
            ground.position.set(0, 0, -4),
            ground.receiveShadow = !0,
            T.add(ground);

            /* ================= OFFICE FLOOR (inside) ================= */

            var F = { CARPET: 1, WOOD: 2, TILE: 3, DARK: 4, RUG: 5, MAT: 6 }
              , CA = [`#47506b`, `#4a5370`, `#434c66`, `#4c5573`].map(d)
              , WO = [`#9a6a42`, `#a2714a`, `#8f623c`, `#a8784f`].map(d);

            function floorType(x, z) {
                if (x >= 6 && z >= 3) return F.WOOD;
                if (x >= 6 && z >= -9 && z < 1) return F.CARPET;
                if (x >= 6) return F.WOOD;
                if (x <= -10.5 && z < -5.5) return F.TILE;
                if (x <= -10.5 && z < 1.5) return F.DARK;
                if (x <= -8 && z >= 1.5) {
                    if (x > -17.4 && x < -12.2 && z > 6.6 && z < 9.6) return F.RUG;
                    return F.TILE
                }
                if (z > 2) {
                    if (x > -2.6 && x < 3 && z > 7.6 && z < 9.7) return F.MAT;
                    return F.TILE
                }
                return F.CARPET
            }

            function paintFloor() {
                let t = 576, r = 352;
                let i = m(t, r)
                  , o = i.getContext(`2d`)
                  , s = o.createImageData(t, r);
                let c = m(t, r)
                  , u = c.getContext(`2d`)
                  , dd = u.createImageData(t, r);
                for (let e = 0; e < r; e++)
                    for (let m2 = 0; m2 < t; m2++) {
                        let f = -18 + (m2 + .5) / 16
                          , g2 = -12 + (e + .5) / 16
                          , b = floorType(f, g2)
                          , x = e * t + m2
                          , w = [0, 0, 0]
                          , E = 180;
                        if (b === F.CARPET) {
                            let t2 = l(m2 >> 1, e >> 1);
                            w = CA[Math.floor(t2 * CA.length)],
                            e % 32 === 0 ? w = f2(w, -14) : m2 % 32 === 0 && (w = f2(w, -10)),
                            E = 235
                        } else if (b === F.WOOD) {
                            w = WO[Math.floor(l(e >> 2, 3) * WO.length)],
                            w = f2(w, Math.round((l(m2, e) - .5) * 12)),
                            e % 4 === 0 ? w = f2(w, -26) : (m2 + (e >> 2) * 5) % 24 === 0 && (w = f2(w, -18)),
                            l(m2 >> 3, e >> 2) > .97 && (w = [150, 140, 128]),
                            E = 165
                        } else if (b === F.TILE) {
                            w = f2((m2 >> 3) + (e >> 3) & 1 ? `#d8d4ca` : `#c9c5bb`, Math.round((l(m2, e) - .5) * 8)),
                            m2 % 8 === 0 || e % 8 === 0 ? w = [176, 172, 164] : 0,
                            E = 120
                        } else if (b === F.DARK) {
                            w = f2((m2 >> 2) + (e >> 2) & 1 ? `#343b4a` : `#2e3542`, Math.round((l(m2, e) - .5) * 10)),
                            m2 % 4 === 0 || e % 4 === 0 ? w = f2(w, -12) : 0,
                            E = 150
                        } else if (b === F.RUG) {
                            let t2 = m2 < 3 || m2 > t - 4 || e < 3 || e > r - 4;
                            w = t2 ? f2(`#8f543f`, Math.round((l(m2, e) - .5) * 10)) : f2(l(m2 >> 1, e >> 1) > .5 ? `#b56a52` : `#ad6450`, Math.round((l(m2, e) - .5) * 12)),
                            m2 % 16 === 8 && e % 16 === 8 && (w = d(`#e8c9a0`)),
                            E = 250
                        } else {
                            w = f2(`#2e3a4c`, Math.round((l(m2, e) - .5) * 8)),
                            m2 < 2 || m2 > t - 3 || e < 2 || e > r - 3 ? w = d(`#caa25a`) : 0,
                            E = 220
                        }
                        let h2 = x * 4;
                        s.data[h2] = w[0],
                        s.data[h2 + 1] = w[1],
                        s.data[h2 + 2] = w[2],
                        s.data[h2 + 3] = 255,
                        dd.data[h2] = dd.data[h2 + 1] = dd.data[h2 + 2] = E,
                        dd.data[h2 + 3] = 255
                    }
                function f2(t, n) { return Array.isArray(t) ? f(t, n) : f(d(t), n) }
                return o.putImageData(s, 0, 0),
                u.putImageData(dd, 0, 0),
                { map: h(i), rough: h(c) }
            }

            var Ft2 = paintFloor()
              , floorMat = new e.MeshStandardMaterial({ map: Ft2.map, roughnessMap: Ft2.rough, roughness: 1, metalness: 0 });
            lampMats.push(floorMat);
            var officeFloor = new e.Mesh(new e.PlaneGeometry(36.8, 22.8).rotateX(-Math.PI / 2), floorMat);
            officeFloor.position.set(0, .02, -1),
            officeFloor.receiveShadow = !0,
            T.add(officeFloor);

            /* ================= BUILDING SHELL ================= */

            var H = 3;

            function wallSeg(x1, z1, x2, z2, y0, y1, mat) {
                let w = Math.abs(x2 - x1), d2 = Math.abs(z2 - z1);
                return bx(Math.max(w, .16), y1 - y0, Math.max(d2, .16), mat, (x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2)
            }

            /* glass partition run along x or z, with door gaps */
            function glassRun(axis, fixed, a0, a1, gaps = []) {
                let segs = [[a0, a1]];
                for (let [g0, g1] of gaps)
                    segs = segs.flatMap(([s0, s1]) => g1 <= s0 || g0 >= s1 ? [[s0, s1]] : [[s0, g0], [g1, s1]]).filter(([s0, s1]) => s1 - s0 > .05);
                for (let [s0, s1] of segs) {
                    let len = s1 - s0, mid = (s0 + s1) / 2;
                    if (axis === `x`) {
                        add(bx(len, .14, .16, M.frame, mid, .07, fixed), bx(len, .14, .16, M.frame, mid, 2.93, fixed));
                        let gl = new e.Mesh(new e.PlaneGeometry(len, 2.66), M.glass);
                        gl.position.set(mid, 1.5, fixed),
                        T.add(gl);
                        for (let x = s0; x <= s1 + .01; x += 2.6)
                            add(bx(.13, 3, .15, M.frame, Math.min(x, s1), 1.5, fixed))
                    } else {
                        add(bx(.16, .14, len, M.frame, fixed, .07, mid), bx(.16, .14, len, M.frame, fixed, 2.93, mid));
                        let gl = new e.Mesh(new e.PlaneGeometry(len, 2.66), M.glass);
                        gl.position.set(fixed, 1.5, mid),
                        gl.rotation.y = Math.PI / 2,
                        T.add(gl);
                        for (let z = s0; z <= s1 + .01; z += 2.6)
                            add(bx(.15, 3, .13, M.frame, fixed, 1.5, Math.min(z, s1)))
                    }
                }
            }

            /* --- north wall (z=-12) with 3 windows --- */
            for (let [x0, x1] of [[-18, -13], [-8, -3], [2, 7], [12, 18]])
                add(wallSeg(x0, -12, x1, -12, 0, H, M.wallIn));
            for (let [x0, x1] of [[-13, -8], [-3, 2], [7, 12]]) {
                add(wallSeg(x0, -12, x1, -12, 0, 1.25, M.wallIn), wallSeg(x0, -12, x1, -12, 2.45, H, M.wallIn));
                let g = new e.Mesh(new e.PlaneGeometry(x1 - x0 - .2, 1.1), M.glass);
                g.position.set((x0 + x1) / 2, 1.85, -11.92),
                g.rotation.y = Math.PI,
                T.add(g),
                add(bx(x1 - x0, .1, .14, M.frame, (x0 + x1) / 2, 1.25, -12), bx(x1 - x0, .1, .14, M.frame, (x0 + x1) / 2, 2.45, -12))
            }

            /* --- east wall (x=18), concrete cladding outside --- */
            {
                let ext = new e.Mesh(new e.PlaneGeometry(22.2, 3), M.concrete);
                ext.position.set(18.12, 1.5, -1),
                ext.rotation.y = Math.PI / 2,
                T.add(ext)
            }
            for (let [z0, z1] of [[-12, -7.5], [-2.5, 2], [6.5, 10]])
                add(wallSeg(18, z0, 18, z1, 0, H, M.wallIn));
            for (let [z0, z1] of [[-7.5, -2.5], [2, 6.5]]) {
                add(wallSeg(18, z0, 18, z1, 0, 1.25, M.wallIn), wallSeg(18, z0, 18, z1, 2.45, H, M.wallIn));
                let g = new e.Mesh(new e.PlaneGeometry(z1 - z0 - .2, 1.1), M.glass);
                g.position.set(17.92, 1.85, (z0 + z1) / 2),
                g.rotation.y = -Math.PI / 2,
                T.add(g),
                add(bx(.14, .1, z1 - z0, M.frame, 18, 1.25, (z0 + z1) / 2), bx(.14, .1, z1 - z0, M.frame, 18, 2.45, (z0 + z1) / 2))
            }

            /* --- west wall (x=-18) --- */
            for (let [z0, z1] of [[-12, -7.5], [-2.5, 2], [6.5, 10]])
                add(wallSeg(-18, z0, -18, z1, 0, H, M.wallIn));
            for (let [z0, z1] of [[-7.5, -2.5], [2, 6.5]]) {
                add(wallSeg(-18, z0, -18, z1, 0, 1.25, M.wallIn), wallSeg(-18, z0, -18, z1, 2.45, H, M.wallIn));
                let g = new e.Mesh(new e.PlaneGeometry(z1 - z0 - .2, 1.1), M.glass);
                g.position.set(-17.92, 1.85, (z0 + z1) / 2),
                g.rotation.y = Math.PI / 2,
                T.add(g)
            }

            /* --- south glass curtain (z=10) with entrance gap x -1.5..2.5 --- */
            add(bx(16.5, .16, .18, M.frame, -9.75, .08, 10), bx(15.5, .16, .18, M.frame, 10.25, .08, 10),
                bx(16.5, .16, .18, M.frame, -9.75, 2.92, 10), bx(15.5, .16, .18, M.frame, 10.25, 2.92, 10),
                bx(36, .1, .17, M.frame, 0, 2.48, 10));
            for (let x = -18; x <= 18.01; x += 3.6)
                (x < -1.2 || x > 2.2) && add(bx(.15, 3, .16, M.frame, x, 1.5, 10));
            {
                let g = new e.Mesh(new e.PlaneGeometry(16.5, 2.75), M.glass);
                g.position.set(-9.75, 1.52, 10),
                T.add(g);
                let g2 = new e.Mesh(new e.PlaneGeometry(15.5, 2.75), M.glass);
                g2.position.set(10.25, 1.52, 10),
                T.add(g2)
            }
            add(bx(.15, 3, .16, M.frame, -1.5, 1.5, 10), bx(.15, 3, .16, M.frame, 2.5, 1.5, 10));
            /* open glass entrance doors */
            for (let s of [-1, 1]) {
                let pivot = s < 0 ? -1.44 : 2.44
                  , dir = s < 0 ? 1 : -1;
                let dg = new e.Group;
                dg.position.set(pivot, 0, 10);
                let leaf = new e.Group;
                leaf.rotation.y = dir * .85;
                let pane = new e.Mesh(new e.PlaneGeometry(1.84, 2.5), M.glassDoor);
                pane.position.set(dir * .92, 1.4, 0),
                leaf.add(pane),
                leaf.add(bx(.08, 2.5, .1, M.frame, 0, 1.4, 0), bx(.08, 2.5, .1, M.frame, dir * 1.84, 1.4, 0), bx(1.9, .09, .1, M.frame, dir * .95, 2.52, 0), bx(.09, .5, .09, M.frameLight, dir * 1.5, 1.15, .1)),
                dg.add(leaf),
                T.add(dg)
            }
            /* welcome mat + sign above entrance */
            {
                let mat = new e.Mesh(new e.PlaneGeometry(3.4, 1.8).rotateX(-Math.PI / 2), new e.MeshStandardMaterial({ map: h(texLogo(112, 56, `#2e3a4c`, `#d8b46a`, `HELLO!`, 22)), roughness: .95 }));
                mat.position.set(.5, .03, 11.6),
                mat.receiveShadow = !0,
                T.add(mat);
                let sign = new e.Mesh(new e.PlaneGeometry(4.4, 1.05), new e.MeshBasicMaterial({ map: h(texLogo(132, 32, `#20242e`, `#ffb46b`, `BITWORKS`, 24)), transparent: !0, side: e.DoubleSide }));
                sign.position.set(.5, 3.45, 10.05),
                T.add(sign)
            }

            /* ================= INTERIOR PARTITIONS ================= */

            /* CEO office: glass north (z=3) with door gap, glass west (x=6) */
            glassRun(`x`, 3, 6.2, 17.9, [[6.9, 8.1]]);
            glassRun(`z`, 6, 3.1, 9.8, []);
            /* meeting room: glass west (x=6, z -9..1, door gap) & south (z=1, x 6..18, door gap) */
            glassRun(`z`, 6, -8.9, .9, [[-2.3, -1.1]]);
            glassRun(`x`, 1, 6.2, 17.9, [[13.8, 15]]);
            /* server room: glass south (z=1.5) with gap + solid east (x=-10.5) */
            glassRun(`x`, 1.5, -17.4, -10.6, [[-13, -11.8]]);
            add(wallSeg(-10.5, -5, -10.5, 1.4, 0, H, M.wallIn));
            /* kitchen east wall with opening (x=-10.5, z -12..-5.5, gap z -9.2..-7.2) */
            add(wallSeg(-10.5, -12, -10.5, -9.2, 0, H, M.wallIn), wallSeg(-10.5, -7.2, -10.5, -5.5, 0, H, M.wallIn));
            /* meeting north wall solid (z=-9) for whiteboard */
            add(wallSeg(6, -9, 18, -9, 0, H, M.wallIn));

            /* --- columns + beams --- */
            for (let [cx, cz] of [[-8.2, -3.2], [1.8, -3.2], [-8.2, 2.8], [1.8, 2.8]])
                add(bx(.42, H, .42, M.cap, cx, H / 2, cz));
            add(bx(22.8, .16, .3, M.beam, -6.2, 2.88, -3.2), bx(22.8, .16, .3, M.beam, -6.2, 2.88, 2.8), bx(11.4, .16, .3, M.beam, 11.7, 2.88, -4));
            /* ================= FURNITURE BUILDERS ================= */

            var nightGlow = []   /* { mat, k, th } — emissive ramps at night */
              , halos = [];      /* sprite glows */

            function halo(x, y, z, size, color, th = .45) {
                let s = new e.Sprite(new e.SpriteMaterial({ map: ze, color, transparent: !0, opacity: 0, depthWrite: !1 }));
                s.position.set(x, y, z),
                s.scale.setScalar(size),
                T.add(s),
                halos.push({ spr: s, k: 1, th });
                return s
            }

            function screenMat(tex, glow = 1) {
                let mat = new e.MeshBasicMaterial({ map: tex });
                return mat
            }

            /* --- desk chair --- */
            var chairGeo = null;
            function chair(x, z, ry, fab = M.chairFab) {
                let g = new e.Group;
                g.position.set(x, 0, z),
                g.rotation.y = ry;
                let base = new e.Mesh(new e.CylinderGeometry(.24, .27, .05, 10), M.metal);
                base.position.y = .035,
                base.castShadow = !0,
                g.add(base);
                let pole = new e.Mesh(new e.CylinderGeometry(.025, .025, .32, 6), M.metal);
                pole.position.y = .2,
                g.add(pole);
                let seat = new e.Mesh(new e.BoxGeometry(.48, .09, .46), fab);
                seat.position.y = .42,
                seat.castShadow = seat.receiveShadow = !0,
                g.add(seat);
                let back = new e.Mesh(new e.BoxGeometry(.46, .5, .09), fab);
                back.position.set(0, .72, -.215),
                back.castShadow = !0,
                g.add(back);
                for (let s of [-1, 1]) {
                    let arm = new e.Mesh(new e.BoxGeometry(.07, .05, .3), M.metal);
                    arm.position.set(s * .26, .55, -.02),
                    arm.castShadow = !0,
                    g.add(arm);
                    let post = new e.Mesh(new e.BoxGeometry(.05, .16, .05), M.metal);
                    post.position.set(s * .24, .47, .1),
                    g.add(post)
                }
                return T.add(g), g
            }

            /* --- monitor: back to camera (screen away) or angled (ry) --- */
            function monitor(x, y, z, ry, withScreen, parent) {
                let g = new e.Group;
                g.position.set(x, y, z),
                g.rotation.y = ry;
                let foot = new e.Mesh(new e.BoxGeometry(.22, .03, .16), M.monScreenEdge);
                foot.castShadow = !0,
                g.add(foot);
                let neck = new e.Mesh(new e.BoxGeometry(.05, .16, .05), M.monScreenEdge);
                neck.position.y = .09,
                g.add(neck);
                let panelMats = [M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, withScreen ? screenMat(s([codeTex1, codeTex2, codeTex3])) : M.monBack, M.monBack];
                let panel = new e.Mesh(new e.BoxGeometry(.64, .4, .045), panelMats);
                panel.position.y = .33,
                panel.rotation.x = -.06,
                panel.castShadow = !0,
                g.add(panel);
                return (parent || T).add(g), g
            }

            /* --- laptop, screen visible toward camera-ish --- */
            var codeTex1 = codeScreen(1), codeTex2 = codeScreen(2), codeTex3 = codeScreen(3);
            function laptop(x, y, z, ry, parent) {
                let g = new e.Group;
                g.position.set(x, y, z),
                g.rotation.y = ry;
                let base = new e.Mesh(new e.BoxGeometry(.42, .025, .3), M.metal);
                base.position.y = .012,
                base.castShadow = !0,
                g.add(base);
                let kb = new e.Mesh(new e.BoxGeometry(.36, .008, .2), M.keyb);
                kb.position.set(0, .028, .02),
                g.add(kb);
                let lid = new e.Group;
                lid.position.set(0, .02, -.14),
                lid.rotation.x = -.98;
                let scr = new e.Mesh(new e.BoxGeometry(.42, .28, .02), [M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, screenMat(s([codeTex1, codeTex2, codeTex3])), M.monScreenEdge]);
                scr.position.y = .14,
                scr.castShadow = !0,
                lid.add(scr),
                g.add(lid);
                return (parent || T).add(g), g
            }

            /* --- full workstation: desk + monitor + keyboard + chair + props --- */
            function workstation(x, z, opts = {}) {
                let { standing = !1, laptop2 = !1, plant = !1, lamp = !1, papers = !1, mugCol = `#c86a4a`, dual = !1, whiteTop = !1, chairFab = M.chairFab } = opts
                  , h = standing ? 1.04 : .72
                  , g = new e.Group;
                g.position.set(x, 0, z);
                let top = new e.Mesh(new e.BoxGeometry(2.1, .06, 1.02), whiteTop ? M.deskTopW : M.deskTop);
                top.position.y = h - .03,
                top.castShadow = top.receiveShadow = !0,
                g.add(top);
                for (let s of [-1, 1]) {
                    let leg = new e.Mesh(new e.BoxGeometry(.06, h - .06, .9), M.metal);
                    leg.position.set(s * .98, (h - .06) / 2, 0),
                    leg.castShadow = !0,
                    g.add(leg);
                    let foot = new e.Mesh(new e.BoxGeometry(.08, .04, .96), M.metal);
                    foot.position.set(s * .98, .02, 0),
                    g.add(foot)
                }
                monitor(0, h + .01, -.28, a(-.12, .12), !1, g);
                let kb = new e.Mesh(new e.BoxGeometry(.44, .025, .16), M.keyb);
                kb.position.set(0, h + .025, .18),
                g.add(kb);
                let mouse = new e.Mesh(new e.BoxGeometry(.07, .025, .1), M.monScreenEdge);
                mouse.position.set(.36, h + .025, .2),
                g.add(mouse);
                let mug = new e.Mesh(new e.CylinderGeometry(.045, .04, .09, 8), new e.MeshStandardMaterial({ color: mugCol, roughness: .6 }));
                mug.position.set(-.72, h + .045, .3),
                mug.castShadow = !0,
                g.add(mug);
                if (laptop2 || standing)
                    laptop(standing ? .3 : .55 * (Math.random() < .5 ? 1 : -1), h, .12, standing ? -.9 : a(-.6, -.25), g);
                if (dual) {
                    let m2 = monitor(.72, h + .01, -.22, a(-.55, -.3), !1, g);
                    m2.scale.set(.82, .82, 1)
                }
                if (plant) {
                    let p = plantSmall();
                    p.position.set(-.88, h, -.32),
                    g.add(p)
                }
                if (lamp)
                    deskLamp(g, .8, h, -.3);
                if (papers) {
                    let pp = new e.Mesh(new e.BoxGeometry(.3, .012, .4), M.white);
                    pp.position.set(-.3, h + .03, .05),
                    pp.rotation.y = a(-.4, .4),
                    g.add(pp);
                    let pp2 = new e.Mesh(new e.BoxGeometry(.28, .01, .38), M.deskTopW);
                    pp2.position.set(-.28, h + .042, .08),
                    pp2.rotation.y = a(-.5, .2),
                    g.add(pp2)
                }
                return T.add(g), g
            }

            /* small potted plant (returns group, not added) */
            function plantSmall() {
                let g = new e.Group;
                let pot = new e.Mesh(new e.CylinderGeometry(.09, .07, .13, 8), M.pot);
                pot.position.y = .065,
                pot.castShadow = !0,
                g.add(pot);
                let soil = new e.Mesh(new e.CylinderGeometry(.075, .075, .02, 8), M.soil);
                soil.position.y = .125,
                g.add(soil);
                let f1 = new e.Mesh(new e.BoxGeometry(.18, .16, .18), M.leaf);
                f1.position.y = .21,
                f1.rotation.y = .4,
                f1.castShadow = !0,
                g.add(f1);
                let f2 = new e.Mesh(new e.BoxGeometry(.13, .12, .13), M.leafDark);
                f2.position.y = .32,
                f2.rotation.y = .9,
                f2.castShadow = !0,
                g.add(f2);
                return g
            }

            /* big floor plant */
            function plantBig(x, z) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let pot = new e.Mesh(new e.CylinderGeometry(.2, .16, .34, 8), M.pot);
                pot.position.y = .17,
                pot.castShadow = !0,
                g.add(pot);
                let soil = new e.Mesh(new e.CylinderGeometry(.17, .17, .02, 8), M.soil);
                soil.position.y = .34,
                g.add(soil);
                for (let i = 0; i < 3; i++) {
                    let f = new e.Mesh(new e.BoxGeometry(.44 - i * .08, .34, .44 - i * .08), i % 2 ? M.leafDark : M.leaf);
                    f.position.y = .5 + i * .24,
                    f.rotation.y = i * .8,
                    f.castShadow = !0,
                    g.add(f)
                }
                return T.add(g), g
            }

            /* pendant lamp hanging from beam */
            function pendant(x, z, beamY = 2.88) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let cord = new e.Mesh(new e.BoxGeometry(.018, beamY - 2.42, .018), M.frame);
                cord.position.y = (beamY + 2.42) / 2,
                g.add(cord);
                let shade = new e.Mesh(new e.CylinderGeometry(.05, .19, .17, 10, 1, !0), M.frame);
                shade.position.y = 2.36,
                g.add(shade);
                let bulb = new e.Mesh(new e.SphereGeometry(.055, 8, 6), new e.MeshStandardMaterial({ color: `#ffe9c8`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .4 }));
                bulb.position.y = 2.3,
                g.add(bulb),
                nightGlow.push({ mat: bulb.material, k: 2.2, th: .5 });
                halo(x, 2.26, z, 1.5, `#ffcf9a`, .5);
                return T.add(g), g
            }

            /* floor lamp */
            function floorLamp(x, z, col = `#ffd9a0`) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let base = new e.Mesh(new e.CylinderGeometry(.14, .17, .04, 8), M.metal);
                base.position.y = .02,
                base.castShadow = !0,
                g.add(base);
                let pole = new e.Mesh(new e.CylinderGeometry(.022, .022, 1.32, 6), M.metal);
                pole.position.y = .68,
                pole.castShadow = !0,
                g.add(pole);
                let shade = new e.Mesh(new e.CylinderGeometry(.13, .17, .22, 8, 1, !0), new e.MeshStandardMaterial({ color: `#e8dcc8`, roughness: .9, emissive: col, emissiveIntensity: 0 }));
                shade.position.y = 1.42,
                shade.castShadow = !0,
                g.add(shade),
                nightGlow.push({ mat: shade.material, k: 1.5, th: .5 });
                halo(x, 1.32, z, 1.7, col, .5);
                return T.add(g), g
            }

            /* desk lamp (attached to a workstation group) */
            function deskLamp(g, lx, ly, lz) {
                let base = new e.Mesh(new e.CylinderGeometry(.05, .06, .03, 8), M.metal);
                base.position.set(lx, ly + .015, lz),
                g.add(base);
                let arm = new e.Mesh(new e.BoxGeometry(.03, .3, .03), M.metal);
                arm.position.set(lx, ly + .16, lz + .03),
                arm.rotation.x = .3,
                g.add(arm);
                let head = new e.Mesh(new e.CylinderGeometry(.05, .08, .07, 8), new e.MeshStandardMaterial({ color: `#3a3f4a`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .6 }));
                head.position.set(lx, ly + .3, lz + .12),
                head.rotation.x = 1.1,
                g.add(head),
                nightGlow.push({ mat: head.material, k: 2.6, th: .45 });
                halo(lx + g.position.x, ly + .28 + 0, lz + g.position.z + .12, 1, `#ffd9a0`, .42)
            }

            /* sofa */
            function sofa(x, z, ry, fab = M.sofaFab, w = 2.1) {
                let g = new e.Group;
                g.position.set(x, 0, z),
                g.rotation.y = ry;
                let base = new e.Mesh(new e.BoxGeometry(w, .3, .85), fab);
                base.position.y = .25,
                base.castShadow = base.receiveShadow = !0,
                g.add(base);
                let back = new e.Mesh(new e.BoxGeometry(w, .5, .2), fab);
                back.position.set(0, .62, -.34),
                back.castShadow = !0,
                g.add(back);
                for (let s of [-1, 1]) {
                    let arm = new e.Mesh(new e.BoxGeometry(.2, .34, .8), fab);
                    arm.position.set(s * (w / 2 - .1), .47, 0),
                    arm.castShadow = !0,
                    g.add(arm)
                }
                for (let i = 0; i < 3; i++) {
                    let cu = new e.Mesh(new e.BoxGeometry(w / 3 - .08, .1, .62), i === 1 ? M.rust : fab);
                    cu.position.set((i - 1) * (w / 3 - .02), .42, .04),
                    cu.castShadow = !0,
                    g.add(cu)
                }
                for (let sx of [-w / 2 + .15, w / 2 - .15])
                    for (let sz of [-.3, .3]) {
                        let leg = new e.Mesh(new e.BoxGeometry(.06, .1, .06), M.bark);
                        leg.position.set(sx, .05, sz),
                        g.add(leg)
                    }
                return T.add(g), g
            }

            function armchair(x, z, ry, fab = M.rust) {
                let g = sofa(x, z, ry, fab, 1.05);
                return g
            }

            function lowTable(x, z, ry = 0) {
                let g = new e.Group;
                g.position.set(x, 0, z),
                g.rotation.y = ry;
                let top = new e.Mesh(new e.BoxGeometry(1, .05, .55), M.deskTop);
                top.position.y = .34,
                top.castShadow = top.receiveShadow = !0,
                g.add(top);
                for (let sx of [-.4, .4])
                    for (let sz of [-.18, .18]) {
                        let leg = new e.Mesh(new e.BoxGeometry(.06, .32, .06), M.metal);
                        leg.position.set(sx, .16, sz),
                        g.add(leg)
                    }
                return T.add(g), g
            }

            /* bookshelf */
            function bookshelf(x, z, ry, w = 2) {
                let g = new e.Group;
                g.position.set(x, 0, z),
                g.rotation.y = ry;
                let frame = new e.Mesh(new e.BoxGeometry(w, 1.9, .32), M.deskTop);
                frame.position.y = .95,
                frame.castShadow = !0,
                g.add(frame);
                for (let i = 0; i < 3; i++) {
                    let sh = new e.Mesh(new e.BoxGeometry(w - .06, .035, .28), M.deskTopW);
                    sh.position.set(0, .32 + i * .52, .04),
                    g.add(sh);
                    let bks = new e.Mesh(new e.BoxGeometry(w - .12, .34, .2), M.books);
                    bks.position.set(0, .52 + i * .52, .03),
                    bks.castShadow = !0,
                    g.add(bks)
                }
                return T.add(g), g
            }
            /* ================= INTERIOR PLACEMENT ================= */

            var fans = []      /* spinning AC fans */
              , steam = [];   /* coffee steam sprites */

            /* --- open workspace --- */
            var deskOpts = [
                { laptop2: !0, mugCol: `#c86a4a` }, { plant: !0, dual: !0, mugCol: `#3e6bc8` },
                { papers: !0, lamp: !0, mugCol: `#4a9a6a` }, { laptop2: !0, plant: !0, mugCol: `#e0b040` },
                { dual: !0, mugCol: `#8a5fb0` }, { laptop2: !0, papers: !0, mugCol: `#d95d5d` },
                { plant: !0, lamp: !0, mugCol: `#4f5a6e` }, { laptop2: !0, mugCol: `#2f6bd8` }
            ];
            var deskSpots = [];
            /* whole grid shifted east of the server-room wall (x = -10.5) — no desk crosses it any more,
               and the two old x = -10 desks no longer straddle the partition */
            [[-8.9, -1.0], [-5.4, -1.0], [-1.9, -1.0], [1.6, -1.0], [-8.9, -5.0], [-5.4, -5.0], [-1.9, -5.0], [1.6, -5.0]]
                .forEach(([dx, dz], i) => {
                    workstation(dx, dz, deskOpts[i]);
                    chair(dx, dz - .88, a(-.25, .25), i % 3 === 0 ? M.chairFab2 : M.chairFab),
                    deskSpots.push({ x: dx, z: dz, standing: !1, chair: { x: dx, z: dz - .88 } })
                });
            /* standing row pulled south (clear of the window wall) and east (clear of the kitchen) */
            [[-9.3, -10.45], [-5.8, -10.45], [-2.3, -10.45]].forEach(([dx, dz], i) => {
                workstation(dx, dz, { standing: !0, laptop2: !1, papers: i === 1, mugCol: [`#c86a4a`, `#3e6bc8`, `#4a9a6a`][i] }),
                deskSpots.push({ x: dx, z: dz, standing: !0, chair: null })
            });
            /* corner white-top desk is now a standing bar too (its old chair pinched the north wall) */
            workstation(1.2, -10.45, { whiteTop: !0, standing: !0, laptop2: !0, plant: !0 }),
            deskSpots.push({ x: 1.2, z: -10.45, standing: !0, chair: null });

            /* dashboard + wall clock on north wall */
            {
                let fr = bx(2.8, 1.75, .07, M.cap, 2.5, 2.05, -11.86);
                add(fr);
                let scr = new e.Mesh(new e.PlaneGeometry(2.7, 1.62), screenMat(dashScreen()));
                scr.position.set(2.5, 2.05, -11.8),
                T.add(scr)
            }
            {
                add(bx(.84, .42, .05, M.cap, 5.5, 2.28, -11.9));
                let cl = new e.Mesh(new e.PlaneGeometry(.75, .32), screenMat(clockScreen()));
                cl.position.set(5.5, 2.28, -11.86),
                T.add(cl)
            }

            /* --- meeting room --- */
            {
                let g = new e.Group;
                g.position.set(11.8, 0, -4);
                let top = new e.Mesh(new e.BoxGeometry(4.4, .08, 1.75), M.white);
                top.position.y = .74,
                top.castShadow = top.receiveShadow = !0,
                g.add(top);
                for (let s of [-1, 1]) {
                    let leg = new e.Mesh(new e.BoxGeometry(.16, .71, 1.3), M.metal);
                    leg.position.set(s * 1.9, .355, 0),
                    g.add(leg)
                }
                let papers = new e.Mesh(new e.BoxGeometry(.4, .015, .3), M.white);
                papers.position.set(-1, .78, .2),
                papers.rotation.y = .3,
                g.add(papers);
                let bottle = new e.Mesh(new e.CylinderGeometry(.035, .035, .18, 8), new e.MeshStandardMaterial({ color: `#9fd8f0`, transparent: !0, opacity: .7, roughness: .2 }));
                bottle.position.set(.6, .83, -.2),
                g.add(bottle);
                let lp = laptop(-.4, .78, -.35, 2.4, g);
                T.add(g)
            }
            for (let cx of [10.2, 11.8, 13.4]) {
                chair(cx, -5.05, a(-.2, .2), M.chairFab);
                chair(cx, -2.95, Math.PI + a(-.2, .2), M.chairFab2)
            }
            chair(9.1, -4, Math.PI / 2, M.chairFab);
            chair(14.5, -4, -Math.PI / 2, M.chairFab2);
            {   /* TV on east wall */
                add(bx(.1, 1.5, 2.3, M.cap, 17.82, 1.75, -4));
                let tv = new e.Mesh(new e.PlaneGeometry(2.2, 1.36), screenMat(tvScreen()));
                tv.position.set(17.74, 1.75, -4),
                tv.rotation.y = -Math.PI / 2 + .18,
                T.add(tv)
            }
            {   /* whiteboard on meeting north wall */
                add(bx(2.7, 1.4, .06, M.cap, 10.6, 1.7, -8.92));
                let wb = new e.Mesh(new e.PlaneGeometry(2.6, 1.3), M.whiteboard);
                wb.position.set(10.6, 1.7, -8.87),
                T.add(wb);
                let tray = bx(.9, .04, .1, M.metal, 10.6, .98, -8.84);
                add(tray)
            }
            plantBig(16.8, -8.2);

            /* --- CEO office --- */
            {
                let g = new e.Group;
                g.position.set(11.5, 0, 5.4);
                let top = new e.Mesh(new e.BoxGeometry(3, .07, 1.35), M.deskTop);
                top.position.y = .75,
                top.castShadow = top.receiveShadow = !0,
                g.add(top);
                for (let s of [-1, 1]) {
                    let leg = new e.Mesh(new e.BoxGeometry(.08, .72, 1.2), M.cap);
                    leg.position.set(s * 1.38, .36, 0),
                    leg.castShadow = !0,
                    g.add(leg)
                }
                monitor(-.3, .79, -.4, .1, !1, g);
                laptop(.55, .79, -.1, -.35, g);
                let kb = new e.Mesh(new e.BoxGeometry(.4, .02, .14), M.keyb);
                kb.position.set(-.2, .8, .25),
                g.add(kb);
                let trophy = new e.Mesh(new e.CylinderGeometry(.04, .06, .14, 8), new e.MeshStandardMaterial({ color: `#e0b040`, metalness: .6, roughness: .3, emissive: `#5a4010`, emissiveIntensity: .3 }));
                trophy.position.set(1.15, .85, -.3),
                trophy.castShadow = !0,
                g.add(trophy);
                let mug = new e.Mesh(new e.CylinderGeometry(.045, .04, .09, 8), new e.MeshStandardMaterial({ color: `#1f2430`, roughness: .6 }));
                mug.position.set(-1, .83, .25),
                g.add(mug);
                T.add(g)
            }
            chair(11.5, 4.45, .12, M.chairFab2);
            chair(10.6, 6.7, Math.PI + .2, M.chairFab);
            chair(12.4, 6.7, Math.PI - .2, M.chairFab);
            bookshelf(8.8, 9.55, 0, 2.2);
            bookshelf(11.2, 9.55, 0, 2.2);
            plantBig(16.5, 9.2);
            floorLamp(16.3, 8.7);
            {   /* art on CEO east wall */
                let art = new e.Mesh(new e.PlaneGeometry(1.5, 1), new e.MeshStandardMaterial({ map: h(texLogo(96, 64, `#20242e`, `#8fd6c4`, `keep\nshipping`, 16)), roughness: .9 }));
                art.position.set(17.9, 1.8, 6.4),
                art.rotation.y = -Math.PI / 2,
                T.add(art)
            }

            /* --- server room --- */
            var rackTerminals = [];
            /* single north rack (the old third rack used to clip the corner of the west desk) */
            [[-17.1, -4.3]].forEach(([rx, rz], i) => {
                let g = new e.Group;
                g.position.set(rx, 0, rz);
                let body = new e.Mesh(new e.BoxGeometry(.92, 2.5, .8), M.rack);
                body.position.y = 1.25,
                body.castShadow = body.receiveShadow = !0,
                g.add(body);
                let leds = new e.Mesh(new e.PlaneGeometry(.78, 2.3), new e.MeshBasicMaterial({ map: ledScreen() }));
                leds.position.set(0, 1.28, .41),
                g.add(leds);
                let vent = new e.Mesh(new e.BoxGeometry(.9, .06, .82), M.cap);
                vent.position.y = 2.56,
                g.add(vent);
                if (i === 0) {
                    let term = new e.Mesh(new e.BoxGeometry(.4, .3, .04), [M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, M.monScreenEdge, screenMat(codeTex2), M.monScreenEdge]);
                    term.position.set(.1, 1.35, .44),
                    term.rotation.x = -.15,
                    g.add(term),
                    rackTerminals.push({ x: rx + .1, z: rz + .55 })
                }
                T.add(g)
            });
            [[-17.3, .3], [-17.3, -1.1], [-17.3, -2.5]].forEach(([rx, rz]) => {
                let body = bx(.8, 2.5, .92, M.rack, rx, 1.25, rz);
                add(body);
                let leds = new e.Mesh(new e.PlaneGeometry(.7, 2.3), new e.MeshBasicMaterial({ map: ledScreen() }));
                leds.position.set(rx + .41, 1.28, rz),
                leds.rotation.y = Math.PI / 2,
                T.add(leds)
            });
            {   /* server room AC on east wall, spinning fan */
                let g = new e.Group;
                g.position.set(-10.62, 2.15, -.9);
                let box2 = new e.Mesh(new e.BoxGeometry(.34, .52, .72), M.white);
                box2.castShadow = !0,
                g.add(box2);
                let fanG = new e.Group;
                fanG.position.set(-.18, 0, 0),
                fanG.rotation.y = Math.PI / 2;
                let ring = new e.Mesh(new e.TorusGeometry(.16, .025, 6, 14), M.metal);
                fanG.add(ring);
                for (let i = 0; i < 4; i++) {
                    let bl = new e.Mesh(new e.BoxGeometry(.03, .26, .05), M.metal);
                    bl.rotation.z = i * Math.PI / 4 * 2,
                        bl.rotation.y = .5,
                        fanG.add(bl)
                }
                g.add(fanG),
                fans.push(fanG),
                T.add(g)
            }

            /* --- kitchen --- */
            {
                let run = bx(5.6, .92, .62, M.white, -14.2, .46, -11.5);   /* base cabinets */
                add(run);
                let top = bx(5.7, .05, .68, M.deskTopW, -14.2, .945, -11.5);
                add(top);
                for (let i = 0; i < 5; i++) {   /* cabinet seams + handles */
                    bx(.02, .8, .6, M.metal, -16.4 + i * 1.1, .46, -11.19);
                    bx(.22, .03, .03, M.metal, -16.4 + i * 1.1 + .06, .68, -11.19)
                }
                let up = bx(5.6, .62, .34, M.white, -14.2, 2.28, -11.79);
                add(up);
                for (let i = 0; i < 5; i++)
                    bx(.02, .55, .3, M.metal, -16.4 + i * 1.1, 2.28, -11.6);
                let sink = bx(.7, .06, .44, M.metal, -16.2, .95, -11.5);
                add(sink);
                let faucet = new e.Mesh(new e.BoxGeometry(.05, .22, .05), M.metal);
                faucet.position.set(-16.2, 1.08, -11.72),
                faucet.castShadow = !0,
                T.add(faucet);
                /* fridge */
                let fr2 = bx(.72, 1.72, .66, M.metal, -11.15, .86, -11.4);
                add(fr2);
                bx(.03, .5, .04, M.cap, -11.5, 1.1, -11.06);
                /* microwave */
                let mw = bx(.5, .34, .36, M.cap, -12.3, 1.12, -11.48);
                add(mw);
                let mwin = new e.Mesh(new e.PlaneGeometry(.26, .2), new e.MeshStandardMaterial({ color: `#151a22`, emissive: `#2a3a4a`, emissiveIntensity: .6 }));
                mwin.position.set(-12.3, 1.12, -11.29),
                T.add(mwin);
                /* coffee machine */
                let cm = bx(.36, .42, .32, M.cap, -14.8, 1.18, -11.5);
                add(cm);
                let led = new e.Mesh(new e.BoxGeometry(.05, .05, .02), new e.MeshStandardMaterial({ color: `#222`, emissive: `#7ee787`, emissiveIntensity: 1.2 }));
                led.position.set(-14.8, 1.3, -11.33),
                T.add(led);
                let spout = bx(.06, .1, .06, M.metal, -14.8, 1.05, -11.38);
                add(spout);
                for (let i = 0; i < 6; i++) {   /* steam */
                    let sp = new e.Sprite(new e.SpriteMaterial({ map: ze, color: `#e8ecf0`, transparent: !0, opacity: 0, depthWrite: !1 }));
                    sp.position.set(-14.8 + a(-.08, .08), 1.2, -11.4),
                    sp.scale.setScalar(.14),
                    T.add(sp),
                    steam.push({ spr: sp, ph: i / 6, x: -14.8, z: -11.4 })
                }
                /* round table + chairs */
                let tbl = new e.Mesh(new e.CylinderGeometry(.55, .55, .06, 12), M.deskTop);
                tbl.position.set(-13.5, .72, -8.2),
                tbl.castShadow = tbl.receiveShadow = !0,
                T.add(tbl);
                let pole = new e.Mesh(new e.CylinderGeometry(.05, .05, .7, 8), M.metal);
                pole.position.set(-13.5, .36, -8.2),
                T.add(pole);
                chair(-14.4, -8.2, Math.PI / 2, M.chairFab);
                chair(-12.6, -8.2, -Math.PI / 2, M.chairFab2);
                /* extra north seat at the kitchen table for lunch breaks */
                chair(-13.5, -9.15, 0, M.chairFab);
                /* Pim's laptop on the round table */
                laptop(-13.15, .75, -8.32, .6, T);
                plantBig(-17, -6.4)
            }

            /* --- water cooler --- */
            {
                let g = new e.Group;
                g.position.set(-10.15, 0, -4.62);
                let base = new e.Mesh(new e.BoxGeometry(.36, .96, .36), M.white);
                base.position.y = .48,
                base.castShadow = !0,
                g.add(base);
                let bottle = new e.Mesh(new e.CylinderGeometry(.15, .13, .4, 10), new e.MeshStandardMaterial({ color: `#9fd8f0`, transparent: !0, opacity: .55, roughness: .15 }));
                bottle.position.y = 1.16,
                g.add(bottle);
                T.add(g)
            }

            /* --- reception --- */
            {
                let top = bx(3.4, .06, .7, M.deskTop, -13.3, 1.06, 5.15);
                add(top);
                let front = new e.Mesh(new e.BoxGeometry(3.4, 1.02, .07), M.deskTop);
                front.position.set(-13.3, .51, 5.53),
                front.castShadow = front.receiveShadow = !0,
                T.add(front);
                bx(.07, 1.02, .66, M.deskTop, -11.62, .51, 5.17);
                for (let i = 0; i < 4; i++)
                    bx(.03, .5, .03, M.metal, -14.4 + i * .75, .62, 5.575);
                let accent = new e.Mesh(new e.BoxGeometry(3.4, .1, .02), new e.MeshStandardMaterial({ color: `#ffb46b`, emissive: `#ffb46b`, emissiveIntensity: .25 }));
                accent.position.set(-13.3, .98, 5.575),
                T.add(accent);
                monitor(-13.9, 1.09, 5.05, .35, !0, T);
                let ph = bx(.22, .06, .16, M.cap, -12.5, 1.12, 5.1);
                add(ph);
                let tl = new e.Mesh(new e.CylinderGeometry(.06, .08, .16, 8), new e.MeshStandardMaterial({ color: `#e8dcc8`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .8 }));
                tl.position.set(-11.4, 1.24, 5.1),
                tl.castShadow = !0,
                T.add(tl),
                nightGlow.push({ mat: tl.material, k: 1.6, th: .45 }),
                halo(-11.4, 1.24, 5.1, .9, `#ffd9a0`, .45)
            }
            {   /* wall sconce on column */
                let sc = new e.Mesh(new e.BoxGeometry(.14, .22, .08), new e.MeshStandardMaterial({ color: `#3a3f48`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .6 }));
                sc.position.set(-8.2, 2.05, 3.18),
                T.add(sc),
                nightGlow.push({ mat: sc.material, k: 2.2, th: .45 }),
                halo(-8.2, 2.05, 3.3, 1.1, `#ffd9a0`, .45)
            }
            sofa(-15.6, 8.6, Math.PI, M.sofaFab, 2.1);
            armchair(-13.4, 8.9, -Math.PI / 2 - .3);
            lowTable(-14.6, 8.5, -.1);
            plantBig(-12.2, 9.2);
            plantBig(-8.7, 9.2);
            {
                let logo = new e.Mesh(new e.PlaneGeometry(4.2, 1.6), new e.MeshStandardMaterial({ map: h(texLogo(128, 48, `#20242e`, `#ffb46b`, `BITWORKS`, 30)), roughness: .9 }));
                logo.position.set(-17.86, 2.15, 6.2),
                logo.rotation.y = Math.PI / 2,
                T.add(logo);
                let bar = new e.Mesh(new e.BoxGeometry(.02, .12, 4.2), new e.MeshStandardMaterial({ color: `#ffb46b`, emissive: `#ffb46b`, emissiveIntensity: .3 }));
                bar.position.set(-17.9, 1.15, 6.2),
                T.add(bar)
            }
            floorLamp(-6.8, 8.3);
            armchair(-7.5, 8.9, .6, M.sofaFab);
            lowTable(-6.6, 8, .3);

            /* --- lounge nook (sofa moved against the meeting-room wall so people can actually walk in) --- */
            sofa(10.5, -9.55, Math.PI, M.rust, 2.3);
            lowTable(12.4, -9.9, .5);
            {   /* bean bag */
                let bg = new e.Mesh(new e.SphereGeometry(.42, 10, 8), M.sofaFab);
                bg.scale.set(1, .55, 1),
                bg.position.set(14.6, .24, -10.8),
                bg.castShadow = !0,
                T.add(bg)
            }
            {
                let pb = new e.Mesh(new e.PlaneGeometry(2, 1.1), M.pinboard);
                pb.position.set(14.8, 1.7, -11.9),
                T.add(pb)
            }
            plantBig(16.6, -11);
            floorLamp(16.6, -10.7, `#ffd9a0`);
            laptop(12.35, .37, -9.88, .4, T);

            /* --- columns + beams + pendants --- */
            pendant(-12, -3.2), pendant(-4, -3.2), pendant(-12, 2.8), pendant(-4, 2.8),
            pendant(9.5, -4), pendant(14, -4);

            /* --- corridor extras --- */
            {
                /* printer cabinet relocated to the solid wall between windows (used to choke the north aisle) */
                let cab = bx(.6, .72, .5, M.white, 5, .36, -11.45);
                add(cab);
                let printer = bx(.52, .32, .42, M.deskTopW, 5, .9, -11.45);
                add(printer);
                bx(.36, .1, .1, M.cap, 5, .82, -11.2);
                let paperStack = bx(.3, .12, .24, M.white, 5, .78, -11.45);
                add(paperStack)
            }
            for (let [bxp, bzp] of [[-8.6, -9.4], [4.9, 2.6]]) {
                let bin = new e.Mesh(new e.CylinderGeometry(.16, .13, .36, 10), M.cap);
                bin.position.set(bxp, .18, bzp),
                bin.castShadow = !0,
                T.add(bin)
            }
            {   /* directory totem in lobby */
                let g = new e.Group;
                g.position.set(4.6, 0, 6.8);
                let pole = new e.Mesh(new e.BoxGeometry(.12, 1.5, .12), M.metal);
                pole.position.y = .75,
                g.add(pole);
                let board = new e.Mesh(new e.BoxGeometry(.56, .8, .1), M.cap);
                board.position.y = 1.9,
                g.add(board);
                let scr = new e.Mesh(new e.PlaneGeometry(.48, .7), screenMat(codeTex3));
                scr.position.set(0, 1.9, .06),
                g.add(scr);
                T.add(g)
            }

            /* ================= NEIGHBOURHOOD LAYOUT TABLES (shared by nav + world builders) =================
               The world now extends far past the office parcel: avenues, a cross street, a cherry park with a
               pond, residential courts, meadows and a downtown skyline. Everything lives inside a big outer
               land plane whose far edge is painted as atmospheric haze, so the land never "cuts off" in the sky. */

            var HOOD = (() => {
                let pond = { x: 4, z: -58, rx: 9.5, rz: 7 }
                  , houses = [
                        [-56, -44, -2.85, 0], [-70.5, -51.5, 2.27, 1], [-58, -68.5, -.3, 2],
                        [56, -44, 2.85, 3], [70.5, -51.5, -2.27, 0], [58, -68.5, .3, 1],
                        [66, 8, -1.95, 2], [-72, 6, 2.6, 3]
                    ]
                  , parkBenches = [[-11.5, -61.5, 1.35], [19.5, -61.5, -1.35], [0, -86.5, Math.PI]]
                  , parkedCar = [28, -36.4, .05]
                  , cherries = [
                        /* promenade (petals drift across the front sidewalk) */
                        [34.5, 12.35, 1.05], [-34.5, 12.35, 1], [62, 12.35, .95], [-62, 12.35, 1.05],
                        /* two landmark cherries right behind the office */
                        [10, -33.5, 1.35], [-10, -33.5, 1.35],
                        /* ring grove around the pond */
                        [18.6, -52.7, 1], [11.75, -44.6, 1.05], [-2.55, -43.9, .95], [-14.1, -51.5, 1],
                        [-16.6, -61.3, 1.05], [-1.6, -72, 1], [9.3, -69.9, .95], [18.1, -63.6, 1],
                        /* scattered through the park */
                        [-24, -48, .9], [28, -46, .95], [-20, -70, 1], [30, -68, .9],
                        /* east parkette */
                        [58, 6, .9], [68, -10, .85]
                    ]
                  , greenTrees = [
                        [23.5, 12.6, .95], [-23.5, 12.6, .95], [52.5, 12.6, .9], [-52.5, 12.6, .9], [71.5, 12.6, .95], [-71.5, 12.6, .95],
                        [24, 25.3, 1], [-24, 25.3, 1], [55, 25.3, .95], [-55, 25.3, .95],
                        [-58, -2, 1], [-74, -10, 1.1], [-62, -18, .95], [-80, 2, .9],
                        [58, -2, 1], [74, -10, 1.1], [62, -18, .95], [80, 2, .9],
                        [-30, -60, 1.05], [24, -58, 1], [16, -75, .95],
                        [-78, -58, 1.1], [-84, -46, .95], [-76, -72, 1], [78, -58, 1.1], [84, -46, .95], [76, -72, 1]
                    ]
                  , pines = [
                        [-44, -100, 1.3], [-33, -97, 1.15], [-22, -101, 1.25], [-11, -98, 1.1], [0, -102, 1.35],
                        [11, -98, 1.15], [22, -101, 1.2], [33, -97, 1.1], [44, -100, 1.25],
                        [-88, -20, 1.2], [-91, 4, 1.3], [-86, -44, 1.1], [88, -20, 1.2], [91, 4, 1.3], [86, -44, 1.1]
                    ]
                  , lanterns = [[-9.5, -52.5], [17.5, -52.5], [6, -45], [4, -71.5], [-.5, -88.5]]
                  , lamps = [
                        [25, 15.7, 0], [-25, 15.7, 0], [65, 15.7, 0], [-65, 15.7, 0], [95, 15.7, 0], [-95, 15.7, 0],
                        [25, 24.3, Math.PI], [-25, 24.3, Math.PI], [65, 24.3, Math.PI], [-65, 24.3, Math.PI], [95, 24.3, Math.PI], [-95, 24.3, Math.PI]
                    ]
                  , navN = []
                  , navC = [];
                /* ---- walkable node graph outside the office (peds, dog walkers, cats' roam hints) ---- */
                for (let sx of [-45.8, 45.8])
                    for (let z of [12, 3.6, -4.8, -13.2, -21.6, -30, -38.4, -46.8, -55.2, -63.6, -72])
                        navN.push([sx, z, 0]);
                for (let x of [-38, -30, -22, -14, -6, 2, 10, 18, 26, 34])
                    navN.push([x, -41.9, 0]);
                for (let x of [-40.5, -52, -60, -68, -76, 40.5, 52, 60, 68, 76])
                    navN.push([x, 13.2, 0]);
                navN.push([-14, -44.4, 0], [0, -44.4, 0], [14, -44.4, 0], [-14, -49.8, 0]);
                for (let k = 0; k < 10; k++) {
                    let A = k * Math.PI / 5;
                    navN.push([4 + Math.cos(A) * 12.5, -58 + Math.sin(A) * 12.5, 0]);
                }
                navN.push([1, -77, 0], [-.5, -84.5, 0]);
                for (let [mx, mz] of [[-52.5, 6.2], [-60, 3.8], [-66, -1.8], [-63.5, -9], [-56.5, -15.5], [-50.5, -22], [-46.5, -28.5]])
                    navN.push([mx, mz, 0]);
                for (let [mx, mz] of [[52.5, 6.2], [60, 3.8], [66, -1.8], [63.5, -9], [56.5, -15.5], [50.5, -22], [46.5, -28.5]])
                    navN.push([mx, mz, 0]);
                for (let [cx, cz] of [[-52.5, -47.5], [-58, -52], [-64, -57], [-63, -62], [-57, -59]])
                    navN.push([cx, cz, 0]);
                for (let [cx, cz] of [[52.5, -47.5], [58, -52], [64, -57], [63, -62], [57, -59]])
                    navN.push([cx, cz, 0]);
                /* ---- collision for the new props (houses, pond, benches, parked car) ---- */
                houses.forEach(h => navC.push([h[0], h[1], 3.05]));
                parkBenches.forEach(b => navC.push([b[0], b[1], .45]));
                navC.push([pond.x, pond.z, pond.rx + 2.1], [parkedCar[0], parkedCar[1], 1.2]);
                return { pond, houses, parkBenches, parkedCar, cherries, greenTrees, pines, lanterns, lamps, navN, navC };
            })();

            /* apply lamp injection now that all lamp points are registered */
            lampMats.forEach(t => t.onBeforeCompile = mt);

            /* ================= NAVIGATION =================
               Waypoint graph + collision primitives so nobody ever walks
               through walls, desks or chairs. Mirrors the validated
               offline nav test (all key routes verified clear). */

            var NAV_MRG = .34;   /* person radius for clearance tests */
            var SPEED_MULT = 1;  /* walk-speed multiplier tied to time-lapse */

            /* collision circles [x, z, r] */
            var NAVC = [
                [-8.9, -1.88, .3], [-5.4, -1.88, .3], [-1.9, -1.88, .3], [1.6, -1.88, .3],
                [-8.9, -5.88, .3], [-5.4, -5.88, .3], [-1.9, -5.88, .3], [1.6, -5.88, .3],
                [10.2, -5.05, .3], [11.8, -5.05, .3], [13.4, -5.05, .3],
                [10.2, -2.95, .3], [11.8, -2.95, .3], [13.4, -2.95, .3], [9.1, -4, .3], [14.5, -4, .3],
                [11.5, 4.45, .3], [10.6, 6.7, .3], [12.4, 6.7, .3],
                [-11.15, -11.4, .5], [-13.5, -8.2, .7], [-14.4, -8.2, .3], [-12.6, -8.2, .3], [-13.5, -9.15, .3],
                [-10.15, -4.62, .35],
                [-13.4, 8.9, .55], [-7.5, 8.9, .55], [-14.6, 8.5, .5], [-6.6, 8, .5],
                [14.6, -10.8, .45], [12.4, -9.9, .3],
                [16.8, -8.2, .45], [16.5, 9.2, .45], [-17, -6.4, .45], [-12.2, 9.2, .45], [-8.7, 9.2, .45], [16.6, -11, .45],
                [-17.1, -4.3, .55], [-17.3, .3, .55], [-17.3, -1.1, .55], [-17.3, -2.5, .55],
                [5, -11.45, .5], [4.9, 2.6, .2], [-8.6, -9.4, .2], [4.6, 6.8, .4],
                [-8.2, -3.2, .45], [1.8, -3.2, .45], [-8.2, 2.8, .45], [1.8, 2.8, .45],
                [16.3, 8.7, .22], [-6.8, 8.3, .22], [16.6, -10.7, .22],
                [5.8, 13.3, .2], [3.9, 13.1, .2], [-3.4, 13.1, .2],
                [-14, 15.7, .15], [-4.5, 15.7, .15], [5.5, 15.7, .15], [14.5, 15.7, .15],
                [-26, -8, .5], [-30, 2, .5], [-24.5, 7.5, .5], [25, -6, .5], [29.5, 1.5, .5], [23.5, 7, .5], [10.5, 25.3, .5], [-12, 25.3, .5],
                [-5.6, 12.9, .45], [7.2, 12.4, .45], [-14.5, 12.6, .5], [15.6, 12.3, .48],
                [-15, -17, .6], [4, -17.5, .55], [13, -16.8, .5], [-26.5, -14.5, .58], [26, -15, .52],
                /* neighbourhood props: houses, park benches, pond, parked car */
                ...HOOD.navC
            ];

            /* collision segments [x1, z1, x2, z2, r] — walls shortened at door gaps so doors stay walkable */
            var NAVS = [
                [-9.95, -1, -7.85, -1, .26], [-6.45, -1, -4.35, -1, .26], [-2.95, -1, -.85, -1, .26], [.55, -1, 2.65, -1, .26],
                [-9.95, -5, -7.85, -5, .26], [-6.45, -5, -4.35, -5, .26], [-2.95, -5, -.85, -5, .26], [.55, -5, 2.65, -5, .26],
                [-10.35, -10.45, -8.25, -10.45, .26], [-6.85, -10.45, -4.75, -10.45, .26], [-3.35, -10.45, -1.25, -10.45, .26],
                [.15, -10.45, 2.25, -10.45, .26],
                [10, -4, 13.6, -4, .95], [10.1, 5.4, 12.9, 5.4, .75],
                [-17, -11.5, -11.4, -11.5, .26],
                [-15, 5.2, -11.6, 5.2, .6],
                [-16.6, 8.6, -14.6, 8.6, .45], [9.5, -9.55, 11.5, -9.55, .43],
                [7.7, 9.55, 9.9, 9.55, .5], [10.1, 9.55, 12.3, 9.55, .5],
                [-9.65, 14.7, -8.35, 14.7, .2], [4.85, 14.7, 6.15, 14.7, .2],
                [-18, -12, 18, -12, .3], [-18, 10, -1.4, 10, .3], [2.4, 10, 18, 10, .3],
                [18, -12, 18, 10, .3], [-18, -12, -18, 10, .3],
                [-10.5, -12, -10.5, -9.35, .3], [-10.5, -7.05, -10.5, -5.5, .3], [-10.5, -5, -10.5, 1.4, .3],
                [-17.4, 1.5, -13.3, 1.5, .3], [-11.5, 1.5, -10.6, 1.5, .3],
                [6, -8.9, 6, -2.6, .3], [6, -.8, 6, .9, .3],
                [6.2, 1, 13.6, 1, .3], [15.2, 1, 17.9, 1, .3],
                [6.2, 3, 6.55, 3, .3], [8.45, 3, 17.9, 3, .3],
                [6, 3.1, 6, 9.8, .3],
                [6, -9, 18, -9, .3]
            ];

            /* nav nodes [x, z, inside?1:0] */
            var NAVN = [
                [-34, 13.2, 0], [-27, 13.2, 0], [-20, 13.4, 0], [-13, 13.7, 0], [-8, 13.9, 0], [-2.5, 13.8, 0],
                [.5, 11.4, 0], [3.2, 13.5, 0], [4.3, 13.9, 0], [4.3, 11.4, 0], [8.6, 11.4, 0], [12, 13.7, 0], [18, 13.2, 0], [26, 13.2, 0], [34, 13.2, 0],
                [.5, 9.2, 1], [.5, 6.6, 1], [.2, 3.8, 1], [1.8, 8.6, 1], [4.5, 7.8, 1], [-4, 6.4, 1], [-9, 6.9, 1], [-7.2, 4.2, 1],
                [-12.8, 7.3, 1], [-12.8, 3.3, 1], [-16.8, 2.5, 1], [-17.2, 7.8, 1], [4.2, 2, 1], [5.5, 1.5, 1],
                [5.2, -8.3, 1], [5.2, -5.5, 1], [5.2, -2.9, 1], [5.2, -1.7, 1], [6.75, -1.7, 1], [5.2, .3, 1],
                [7.2, 2.3, 1], [9.5, 2.1, 1], [12, 2.1, 1], [14.4, 2.1, 1], [16.5, 2.1, 1], [14.4, .4, 1], [7.5, 3.8, 1],
                [-15.9, -7.7, 1], [-13.9, -6.6, 1], [-11, -7.7, 1], [-9.05, -7.7, 1], [-6.5, -7.7, 1], [-3, -7.7, 1], [.5, -7.7, 1], [3, -7.7, 1],
                [-7.55, -9.6, 1], [-4.05, -9.6, 1], [-.55, -9.6, 1],
                [-7.55, -11.2, 1], [-4.05, -11.2, 1], [-.55, -11.2, 1], [3.2, -11.2, 1],
                [-15.75, -3.1, 1], [-13.5, -3, 1], [-11.75, -2.9, 1], [-9.4, -3, 1],
                [-7.15, -3, 1], [-3.65, -3, 1], [-.15, -3, 1], [.5, -3, 1], [3.6, -3, 1],
                [-7.15, -5, 1], [-3.65, -5, 1], [-.15, -5, 1],
                [-7.15, .4, 1], [-3.65, .4, 1], [-.15, .4, 1], [.5, .4, 1], [1.8, -4.35, 1], [3, -2.8, 1], [3, -4.4, 1], [3, .4, 1], [3.6, .4, 1],
                [-16, -.9, 1], [-16.4, -3.2, 1], [-12.4, .8, 1], [-12.4, 2.4, 1],
                [-9.4, -8.2, 1], [-11.5, -8.2, 1], [-13.8, -10.2, 1], [-12.2, -10.1, 1],
                [8.5, -1.8, 1], [12, -1.8, 1], [15, -1.8, 1], [7.4, -4, 1], [16.2, -4, 1], [8.5, -7.2, 1], [12.5, -7.2, 1],
                [8.5, 4.2, 1], [8.5, 5.2, 1], [8.5, 7.6, 1], [12, 8, 1], [15, 7.8, 1], [16.3, 4.6, 1], [14.5, 4.3, 1], [10.6, 7.5, 1],
                [7, -9.9, 1], [4.9, -9.7, 1], [8.4, -10.55, 1], [10.2, -10.55, 1], [12.6, -10.55, 1], [13.9, -9.85, 1],
                [2.9, -11.1, 1],
                /* the wide world: avenues, cross street, cherry park ring, meadow paths, residential courts */
                ...HOOD.navN
            ];

            function dPntSeg(px, py, ax, ay, bx, by) {
                let dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
                let t = L ? n(((px - ax) * dx + (py - ay) * dy) / L, 0, 1) : 0;
                return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
            }
            function dSegSeg(a1, b1, a2, b2, c1, d1, c2, d2) {
                let dx1 = a2 - a1, dy1 = b2 - b1, dx2 = c2 - c1, dy2 = d2 - d1;
                let fx = a1 - c1, fy = b1 - d1;
                let A = dx1 * dx1 + dy1 * dy1, B = dx1 * dx2 + dy1 * dy2, C = dx2 * dx2 + dy2 * dy2;
                let D = dx1 * fx + dy1 * fy, E2 = dx2 * fx + dy2 * fy;
                let den = A * C - B * B, s, t;
                s = den > 1e-9 ? n((B * E2 - C * D) / den, 0, 1) : 0;
                t = C > 1e-9 ? n((B * s + E2) / C, 0, 1) : 0;
                s = A > 1e-9 ? n((B * t - D) / A, 0, 1) : 0;
                return Math.hypot(a1 + dx1 * s - (c1 + dx2 * t), b1 + dy1 * s - (d1 + dy2 * t))
            }
            function navLos(ax, az, bx, bz) {
                for (let c of NAVC) if (dPntSeg(c[0], c[1], ax, az, bx, bz) < c[2] + NAV_MRG) return !1;
                for (let g of NAVS) if (dSegSeg(ax, az, bx, bz, g[0], g[1], g[2], g[3]) < g[4] + NAV_MRG) return !1;
                return !0
            }
            var NAV_E = NAVN.map(() => []);
            for (let i = 0; i < NAVN.length; i++)
                for (let j = i + 1; j < NAVN.length; j++) {
                    let dd = Math.hypot(NAVN[i][0] - NAVN[j][0], NAVN[i][1] - NAVN[j][1]);
                    if (dd > .5 && dd < 8.6 && navLos(NAVN[i][0], NAVN[i][1], NAVN[j][0], NAVN[j][1])) {
                        NAV_E[i].push([j, dd]), NAV_E[j].push([i, dd])
                    }
                }
            function navDijkstra(sn, en) {
                let dist = NAVN.map(() => 1e9), prev = NAVN.map(() => -1), done = NAVN.map(() => !1);
                dist[sn] = 0;
                for (; ;) {
                    let uu = -1, best = 1e9;
                    for (let i = 0; i < NAVN.length; i++) if (!done[i] && dist[i] < best) { best = dist[i]; uu = i }
                    if (uu < 0 || uu === en) break;
                    done[uu] = !0;
                    for (let [v, w2] of NAV_E[uu]) if (dist[uu] + w2 < dist[v]) { dist[v] = dist[uu] + w2; prev[v] = uu }
                }
                if (dist[en] >= 1e9) return null;
                let path = [];
                for (let v = en; v >= 0; v = prev[v]) path.unshift(v);
                return path
            }
            function navBest(x, z, needLos) {
                let bi = -1, bd = 1e9;
                for (let i = 0; i < NAVN.length; i++) {
                    let dd = Math.hypot(NAVN[i][0] - x, NAVN[i][1] - z);
                    if (dd < bd && (!needLos || navLos(x, z, NAVN[i][0], NAVN[i][1]))) { bd = dd; bi = i }
                }
                return bi
            }
            function navRoute(ax, az, bx, bz) {
                if (navLos(ax, az, bx, bz)) return [[bx, bz]];
                /* if the caller sits inside a collision circle (a chair), no node has clean
                   LOS — fall back to the NEAREST node instead of walking straight through walls */
                let sn = navBest(ax, az, !0);
                sn < 0 && (sn = navBest(ax, az, !1));
                let en = navBest(bx, bz, !0);
                en < 0 && (en = navBest(bx, bz, !1));
                if (sn < 0 || en < 0) return [[bx, bz]];
                let pth = navDijkstra(sn, en);
                if (!pth) {
                    let a2 = [NAVN[sn][0], NAVN[sn][1]], b2 = [NAVN[en][0], NAVN[en][1]], out2 = [];
                    Math.hypot(ax - a2[0], az - a2[1]) > .05 && out2.push(a2);
                    Math.hypot(bx - b2[0], bz - b2[1]) > .05 && out2.push(b2);
                    out2.push([bx, bz]);
                    return out2
                }
                let pts = pth.map(i2 => [NAVN[i2][0], NAVN[i2][1]]);
                pts.push([bx, bz]);
                let out = [], cx = ax, cz = az, i2 = 0;
                while (i2 < pts.length) {
                    let j = pts.length - 1;
                    while (j > i2 && !navLos(cx, cz, pts[j][0], pts[j][1])) j--;
                    out.push(pts[j]), cx = pts[j][0], cz = pts[j][1], i2 = j + 1
                }
                return out
            }

            /* ---------- shared world spots ---------- */
            var SPAWNS = [[-34, 13.2], [34, 13.2]]
              , DOOR_OUT = [.5, 11.4], DOOR_IN = [.5, 9.2]
              , COFFEE_SPOT = [-14.8, -10.35, -14.8, -11.5]
              , COOLER_SPOT = [-9.5, -3.95, -10.15, -4.62]
              , WINDOW_SPOT = [2.9, -11.05, 2.9, -14]
              , PRINTER_SPOT = [5, -10.5, 5, -11.45]
              , BIN_SPOTS = [[-8.35, -8.75, -8.6, -9.4], [4.55, 1.9, 4.9, 2.6]]
              , KSEATS = [[-12.6, -8.2, .41, -11.8, -8.2, -12.6, -4], [-13.5, -9.15, .41, -13.5, -9.95, -13.5, -4], [-14.4, -8.2, .41, -15.2, -8.2, -14.4, -4]]
              , LOBBY_SEATS = [[-16.35, 8.45, .41, -16.35, 3], [-14.85, 8.45, .41, -14.85, 3]]
              , BEANBAG = [14.6, -10.8, .16]
              , MEET_SEATS = [
                  [10.2, -2.95, .41, 10.2, -2.2], [11.8, -2.95, .41, 11.8, -2.2], [13.4, -2.95, .41, 13.4, -2.2],
                  [9.1, -4, .41, 8.3, -4], [14.5, -4, .41, 15.4, -4]
              ]
              , CEO_GUESTS = [[10.6, 6.7, .41, 10.6, 7.5], [12.4, 6.7, .41, 12.4, 7.5]]
              , PRESENTER_SPOT = [10.6, -7.85, 10.6, -4]
              , RACK_SPOT = [-16.9, -3.4, -17.1, -4.3]
              , PLANT_SPOTS = [[15.9, -8.2, 16.8, -8.2], [15.6, 9.2, 16.5, 9.2], [-16.2, -6.4, -17, -6.4], [-12.2, 8.4, -12.2, 9.2], [-8.7, 8.3, -8.7, 9.2], [15.7, -10.9, 16.6, -11]]
              , CEO_PACE = [16.3, 4.6]
              , CEO_STAND = [11.5, 3.7];
            var CHAT_SPOTS = [
                { a: [-7.15, .9, 0], b: [-5.75, .9, 0] },
                { a: [-12.6, -8.2, .41], b: [-13.5, -9.15, .41] },
                { a: [-16.35, 8.45, .41], b: [-14.85, 8.45, .41] },
                { a: [9.5, 2.1, 0], b: [10.8, 2.1, 0] },
                { a: [2.2, 6.6, 0], b: [.9, 6.9, 0] }
            ];
            var CHAT_EMOJI = [`💬`, `😂`, `👍`, `☕`, `🙂`, `🤔`, `💡`, `🎉`, `😅`, `👀`, `🫡`, `✨`]
              , MEET_BUB = [`📊`, `💬`, `💡`, `✏`, `🤝`, `⚠`, `📈`, `☕`]
              , PED_ACT = [`Taking a stroll`, `Walking off the coffee`, `Headed somewhere nice`, `Counting pigeons`, `Window shopping`]
              , PED_BUB = [`🚶`, `🎧`, `☀`, `📱`, `🥤`, `😌`];

            /* seat occupied? (nearest person check on the seat itself) */
            function seatFree(x, z) {
                for (let p of ROSTER) if (p.group.visible && Math.hypot(p.x - x, p.z - z) < .75) return !1;
                return !0
            }
            function pickFree(list) {
                let free = list.filter(st => seatFree(st[0], st[1]));
                return free.length ? s(free) : null
            }


            /* ================= OUTSIDE ================= */

            /* street lamps */
            for (let lx of [-14, -4.5, 5.5, 14.5]) {
                let g = new e.Group;
                g.position.set(lx, 0, 15.7);
                let pole = new e.Mesh(new e.CylinderGeometry(.05, .07, 3, 6), M.metal);
                pole.position.y = 1.5,
                pole.castShadow = !0,
                g.add(pole);
                let arm = new e.Mesh(new e.BoxGeometry(.08, .08, 1), M.metal);
                arm.position.set(0, 2.96, .5),
                g.add(arm);
                let head = new e.Mesh(new e.BoxGeometry(.22, .1, .5), new e.MeshStandardMaterial({ color: `#2c313a`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .6 }));
                head.position.set(0, 2.9, .95),
                g.add(head),
                nightGlow.push({ mat: head.material, k: 2.2, th: .5 });
                halo(lx, 2.78, 16.65, 2.2, `#ffcf9a`, .5);
                T.add(g)
            }

            /* benches + bins */
            for (let [bxp, bzp] of [[-9, 14.7], [5.5, 14.7]]) {
                let g = new e.Group;
                g.position.set(bxp, 0, bzp);
                let seat = new e.Mesh(new e.BoxGeometry(1.3, .07, .42), M.bark);
                seat.position.y = .42,
                seat.castShadow = seat.receiveShadow = !0,
                g.add(seat);
                let back = new e.Mesh(new e.BoxGeometry(1.3, .34, .06), M.bark);
                back.position.set(0, .68, .2),
                g.add(back);
                for (let s of [-1, 1]) {
                    let leg = new e.Mesh(new e.BoxGeometry(.07, .42, .38), M.metal);
                    leg.position.set(s * .55, .21, 0),
                    g.add(leg)
                }
                T.add(g)
            }
            for (let [bxp, bzp] of [[3.9, 13.1], [-3.4, 13.1]]) {
                let bin = new e.Mesh(new e.CylinderGeometry(.17, .14, .4, 10), new e.MeshStandardMaterial({ color: `#3a5a4a`, roughness: .8 }));
                bin.position.set(bxp, .2, bzp),
                bin.castShadow = !0,
                T.add(bin)
            }

            /* flag */
            var flag = (() => {
                let g = new e.Group;
                g.position.set(5.8, 0, 13.3);
                let pole = new e.Mesh(new e.CylinderGeometry(.03, .045, 4.4, 6), M.metal);
                pole.position.y = 2.2,
                pole.castShadow = !0,
                g.add(pole);
                let knob = new e.Mesh(new e.SphereGeometry(.05, 8, 6), M.cap);
                knob.position.y = 4.45,
                g.add(knob);
                let fg = new e.Group;
                fg.position.y = 4.05;
                let geo = new e.PlaneGeometry(.95, .55);
                geo.translate(.475, 0, 0);
                let fl = new e.Mesh(geo, new e.MeshStandardMaterial({ map: h(texLogo(48, 28, `#ffb46b`, `#20242e`, `BW`, 18)), side: e.DoubleSide, roughness: .9 }));
                fl.castShadow = !0,
                fg.add(fl),
                g.add(fg);
                return T.add(g), fg
            })();

            /* pixel trees */
            var kt = [];
            function tree(x, z, s = 1) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let trunk = new e.Mesh(new e.BoxGeometry(.38 * s, 1.5 * s, .38 * s), M.bark);
                trunk.position.y = .75 * s,
                trunk.castShadow = !0,
                g.add(trunk);
                let crown = new e.Group;
                crown.position.y = 1.5 * s;
                let c1 = new e.Mesh(new e.BoxGeometry(1.5 * s, 1.1 * s, 1.5 * s), Math.random() < .5 ? M.leaf : M.leafDark);
                c1.position.y = .55 * s,
                c1.castShadow = c1.receiveShadow = !0,
                crown.add(c1);
                let c2 = new e.Mesh(new e.BoxGeometry(.95 * s, .8 * s, .95 * s), M.leaf);
                c2.position.set(.15 * s, 1.25 * s, .1 * s),
                c2.castShadow = !0,
                crown.add(c2);
                g.add(crown),
                kt.push({ crown, ph: a(0, c), x, z, s }),
                T.add(g)
            }
            tree(-26, -8, 1.15), tree(-30, 2, 1.4), tree(-24.5, 7.5, 1.05),
            tree(25, -6, 1.3), tree(29.5, 1.5, 1.05), tree(23.5, 7, 1.2),
            tree(10.5, 25.3, .9), tree(-12, 25.3, .85),
            /* extra greenery: plaza promenade + building backdrop (park-style) */
            tree(-5.6, 12.9, .8), tree(7.2, 12.4, .85), tree(-14.5, 12.6, 1), tree(15.6, 12.3, .95),
            tree(-15, -17, 1.2), tree(4, -17.5, 1.1), tree(13, -16.8, 1), tree(-26.5, -14.5, 1.15), tree(26, -15, 1.05);

            /* ================= ATMOSPHERE PARTICLES (park-style) ================= */

            function makePts(NN, additive, soft) {
                let pos = new Float32Array(NN * 3), col = new Float32Array(NN * 3),
                    size = new Float32Array(NN), alp = new Float32Array(NN);
                let geo = new e.BufferGeometry;
                geo.setAttribute(`position`, new e.BufferAttribute(pos, 3)),
                geo.setAttribute(`aColor`, new e.BufferAttribute(col, 3)),
                geo.setAttribute(`aSize`, new e.BufferAttribute(size, 1)),
                geo.setAttribute(`aAlpha`, new e.BufferAttribute(alp, 1));
                let mat = new e.ShaderMaterial({
                    transparent: !0, depthWrite: !1,
                    blending: additive ? e.AdditiveBlending : e.NormalBlending,
                    uniforms: { uScale: { value: 400 }, uSoft: { value: soft ? 1 : 0 }, uTint: { value: new e.Color(1, 1, 1) }, uTintAmt: { value: 0 } },
                    vertexShader: `attribute vec3 aColor;attribute float aSize;attribute float aAlpha;varying vec3 vC;varying float vA;uniform float uScale;
void main(){vC=aColor;vA=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(1.,aSize*uScale/-mv.z);}`,
                    fragmentShader: `uniform float uSoft,uTintAmt;uniform vec3 uTint;varying vec3 vC;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=uSoft>.5?smoothstep(.5,.05,d):1.;a*=vA;if(a<.01)discard;
  gl_FragColor=vec4(vC*mix(vec3(1.),uTint,uTintAmt),a);}`
                });
                let obj = new e.Points(geo, mat);
                return obj.frustumCulled = !1, T.add(obj), { pos, col, size, alp, geo, mat, obj, NN, commit() { for (let k of [`position`, `aColor`, `aSize`, `aAlpha`]) geo.attributes[k].needsUpdate = !0 } }
            }

            /* --- falling leaves around every outside tree (pomodoro-park style) --- */
            var LEAF_TREES = kt.map(t => ({ x: t.x, z: t.z, y: 2.05 * t.s, r: .95 * t.s }))
              , LEAF_COLS = [`#4f8f3c`, `#3f7a33`, `#57923f`, `#6aad4c`, `#8a6a3a`, `#a8792f`].map(cc => new e.Color(cc))
              , LEAF_N = 150
              , leafPts = makePts(LEAF_N, !1, !0)
              , leafSt = [];
            for (let i = 0; i < LEAF_N; i++) {
                leafSt.push({ mode: 0, t: a(0, 9), ph: a(0, c), sp: a(.75, 1.3), tr: LEAF_TREES[Math.floor(a(0, LEAF_TREES.length))] });
                leafPts.alp[i] = 0;
                let cc = LEAF_COLS[Math.floor(a(0, LEAF_COLS.length))];
                leafPts.col[i * 3] = cc.r, leafPts.col[i * 3 + 1] = cc.g, leafPts.col[i * 3 + 2] = cc.b
            }
            function leafSpawn(i2) {
                let st = leafSt[i2], tr = st.tr;
                st.mode = 1;
                let ang = a(0, c), rr = Math.sqrt(Math.random()) * tr.r;
                leafPts.pos[i2 * 3] = tr.x + Math.cos(ang) * rr;
                leafPts.pos[i2 * 3 + 1] = tr.y + a(.1, .8);
                leafPts.pos[i2 * 3 + 2] = tr.z + Math.sin(ang) * rr;
                leafPts.alp[i2] = 0;
                let cc = LEAF_COLS[Math.floor(a(0, LEAF_COLS.length))];
                leafPts.col[i2 * 3] = cc.r, leafPts.col[i2 * 3 + 1] = cc.g, leafPts.col[i2 * 3 + 2] = cc.b
            }
            function updLeaves(dt, tm) {
                for (let i2 = 0; i2 < LEAF_N; i2++) {
                    let st = leafSt[i2], k = i2 * 3;
                    if (st.mode === 0) {
                        st.t -= dt;
                        leafPts.alp[i2] = Math.max(0, leafPts.alp[i2] - dt * 2);
                        st.t < 0 && leafSpawn(i2)
                    } else if (st.mode === 1) {
                        leafPts.alp[i2] = Math.min(1, leafPts.alp[i2] + dt * 3);
                        let sway = Math.sin(tm * 1.3 + st.ph);
                        leafPts.pos[k] += (sway * .5 + Math.sin(tm * .3 + st.ph * 2) * .3) * dt * st.sp;
                        leafPts.pos[k + 1] -= (.5 + Math.sin(tm * 1.7 + st.ph) * .15) * dt * st.sp;
                        leafPts.pos[k + 2] += (Math.cos(tm * .9 + st.ph) * .4 + Math.sin(tm * .21) * .35) * dt * st.sp;
                        leafPts.pos[k + 1] <= .05 && (leafPts.pos[k + 1] = .05, st.mode = 2, st.t = a(2.5, 7))
                    } else {
                        st.t -= dt;
                        st.t < .8 && (leafPts.alp[i2] = Math.max(0, st.t / .8));
                        st.t <= 0 && (st.mode = 0, st.t = a(1, 8), st.tr = LEAF_TREES[Math.floor(a(0, LEAF_TREES.length))])
                    }
                }
                leafPts.commit()
            }

            /* --- dust motes drifting through the office light --- */
            var DUST_N = 70
              , dustPts = makePts(DUST_N, !0, !0)
              , dustSt = [];
            for (let i = 0; i < DUST_N; i++) {
                dustSt.push({ ph: a(0, c), sp: a(.4, 1) });
                dustPts.pos[i * 3] = a(-17, 17);
                dustPts.pos[i * 3 + 1] = a(.3, 2.6);
                dustPts.pos[i * 3 + 2] = a(-11, 9);
                dustPts.size[i] = a(.025, .05);
                dustPts.col[i * 3] = dustPts.col[i * 3 + 1] = dustPts.col[i * 3 + 2] = 1
            }
            function updDust(dt, tm, day) {
                for (let i = 0; i < DUST_N; i++) {
                    let st = dustSt[i], k = i * 3;
                    dustPts.pos[k] += Math.sin(tm * .12 * st.sp + st.ph) * dt * .12;
                    dustPts.pos[k + 1] += Math.cos(tm * .09 * st.sp + st.ph * 2) * dt * .05;
                    dustPts.pos[k + 2] += Math.cos(tm * .1 * st.sp + st.ph) * dt * .12;
                    dustPts.pos[k + 1] < .2 && (dustPts.pos[k + 1] = 2.5);
                    dustPts.pos[k + 1] > 2.7 && (dustPts.pos[k + 1] = .3);
                    dustPts.alp[i] = (0.028 + 0.026 * Math.sin(tm * .8 + st.ph * 3)) * (.25 + .75 * day)
                }
                dustPts.commit()
            }

            /* --- fireflies over the pond, lawns & meadows at night (park homage) --- */
            var FFZ = [
                { x: 4, z: -58, r: 11, n: 14 },      /* cherry pond */
                { x: 0, z: -16, r: 15, n: 8 },       /* back lawn */
                { x: -64, z: -6, r: 11, n: 8 },      /* west meadow */
                { x: 64, z: -6, r: 11, n: 8 },      /* east parkette */
                { x: 0, z: 28, r: 14, n: 8 }         /* front lawn */
            ]
              , FF_N = FFZ.reduce((t2, z2) => t2 + z2.n, 0)
              , ffPts = makePts(FF_N, !0, !0)
              , ffSt = [];
            for (let zi = 0; zi < FFZ.length; zi++)
                for (let k = 0; k < FFZ[zi].n; k++) {
                    let i = ffSt.length, zz = FFZ[zi];
                    ffSt.push({ ph: a(0, c), sp: a(.5, 1.1), zone: zz });
                    ffPts.pos[i * 3] = zz.x + a(-zz.r, zz.r) * .8;
                    ffPts.pos[i * 3 + 1] = a(.4, 1.7);
                    ffPts.pos[i * 3 + 2] = zz.z + a(-zz.r, zz.r) * .8;
                    ffPts.size[i] = a(.05, .09);
                    ffPts.col[i * 3] = .78, ffPts.col[i * 3 + 1] = 1, ffPts.col[i * 3 + 2] = .55
                }
            function updFireflies(dt, tm, night) {
                for (let i = 0; i < FF_N; i++) {
                    let st = ffSt[i], k = i * 3;
                    ffPts.pos[k] += Math.sin(tm * .35 * st.sp + st.ph) * dt * .5;
                    ffPts.pos[k + 1] += Math.cos(tm * .5 * st.sp + st.ph * 2) * dt * .22;
                    ffPts.pos[k + 2] += Math.cos(tm * .3 * st.sp + st.ph) * dt * .4;
                    let ddx = ffPts.pos[k] - st.zone.x, ddz = ffPts.pos[k + 2] - st.zone.z;
                    Math.hypot(ddx, ddz) > st.zone.r && (ffPts.pos[k] = st.zone.x + ddx * .96, ffPts.pos[k + 2] = st.zone.z + ddz * .96);
                    ffPts.pos[k + 1] = n(ffPts.pos[k + 1], .3, 2);
                    ffPts.alp[i] = Math.pow(Math.max(0, Math.sin(tm * 1.1 + st.ph * 5)), 3) * night
                }
                ffPts.commit()
            }

            /* ================= NEIGHBOURHOOD EXPANSION (pomodoro-park homage) =================
               One huge outer land plane (248×248) carries the rest of the world: the boulevard runs to the
               horizon, avenues + a cross street serve quiet courts, a cherry park wraps a pond behind the
               office, meadows roll west/east, a downtown skyline rises south — and the outer band is painted
               as dithered sky-haze so the land dissolves into the sky instead of cutting off. */

            function paintOuter() {
                let SZ = 1984, SC = 8, CX = 124, CZ = 128;   /* 248 units, 8px per unit, centred on (0,-4) */
                /* masks: red channel = gravel paths, blue channel = pond bed */
                let mk = m(SZ, SZ), mc = mk.getContext(`2d`);
                let P2 = (x, z) => [(x + CX) * SC, (z + CZ) * SC];
                mc.strokeStyle = `#f00`, mc.fillStyle = `#00f`, mc.lineWidth = SC * 1.15, mc.lineCap = `round`, mc.lineJoin = `round`;
                let lanes = [
                    /* park gates to the pond ring */
                    [[-14, -42.6], [-14, -49.8]], [[-14, -49.8], [-8.5, -54.3]],
                    [[0, -42.6], [0, -45.3]], [[0, -45.3], [4, -45.8]],
                    [[14, -42.6], [14, -49.8]], [[14, -49.8], [12.4, -52]],
                    /* north viewpoint exit */
                    [[4, -70.5], [1, -77]], [[1, -77], [-.5, -84.5]],
                    /* west meadow path */
                    [[-49.2, 4], [-56, 6.2]], [[-56, 6.2], [-63.5, 3]], [[-63.5, 3], [-69.5, -3]],
                    [[-69.5, -3], [-65.5, -11]], [[-65.5, -11], [-57.5, -17]], [[-57.5, -17], [-50.5, -22]], [[-50.5, -22], [-46.5, -28.5]],
                    /* east parkette path */
                    [[49.2, 4], [56, 6.2]], [[56, 6.2], [63.5, 3]], [[63.5, 3], [69.5, -3]],
                    [[69.5, -3], [65.5, -11]], [[65.5, -11], [57.5, -17]], [[57.5, -17], [50.5, -22]], [[50.5, -22], [46.5, -28.5]],
                    /* residential courts */
                    [[-49.2, -46], [-52.5, -47.5]], [[-52.5, -47.5], [-58, -52]], [[-58, -52], [-64, -57]],
                    [[-64, -57], [-63, -62]], [[-63, -62], [-57, -59]], [[-57, -59], [-52.5, -56]],
                    [[49.2, -46], [52.5, -47.5]], [[52.5, -47.5], [58, -52]], [[58, -52], [64, -57]],
                    [[64, -57], [63, -62]], [[63, -62], [57, -59]], [[57, -59], [52.5, -56]]
                ];
                for (let seg of lanes) {
                    let a2 = P2(seg[0][0], seg[0][1]), b2 = P2(seg[1][0], seg[1][1]);
                    mc.beginPath(), mc.moveTo(a2[0], a2[1]), mc.lineTo(b2[0], b2[1]), mc.stroke()
                }
                let pc = P2(4, -58);
                mc.beginPath(), mc.arc(pc[0], pc[1], 12.5 * SC, 0, c), mc.stroke();          /* ring path */
                mc.beginPath(), mc.ellipse(pc[0], pc[1], 9.5 * SC, 7 * SC, 0, 0, c), mc.fill();   /* pond bed */
                let mkd = mc.getImageData(0, 0, SZ, SZ).data;
                /* the colour pass */
                let cv = m(SZ, SZ), cc = cv.getContext(`2d`), im = cc.createImageData(SZ, SZ)
                    , GRV = [`#d4be93`, `#c9b286`, `#dcc8a0`, `#bea77c`].map(d)
                    , URB2 = [`#b9b5ad`, `#b1ada5`, `#c1bdb5`].map(d)
                    , HAZE = [201, 210, 222]
                    , FLW = [[244, 239, 216], [246, 200, 79], [242, 155, 184], [255, 158, 192], [216, 232, 255], [244, 167, 94]];
                for (let py = 0; py < SZ; py++) {
                    let z = -CZ + (py + .5) / SC;
                    for (let px = 0; px < SZ; px++) {
                        let x = -CX + (px + .5) / SC
                          , E = (py * SZ + px) * 4
                          , w;
                        if (x >= -36 && x <= 36 && z >= -34 && z <= 26) {
                            /* hidden under the office parcel — keep it identical anyway */
                            let g2 = groundType(x, z), b = Gpal[g2];
                            w = b.c[Math.floor(l(px, py) * b.c.length)];
                            g2 === G.WALK ? w = px % 8 === 0 || py % 8 === 0 ? [161, 156, 148] : w
                                : g2 === G.PLAZA ? w = py % 8 === 0 ? [168, 141, 106] : (px + (py >> 3) * 8) % 16 === 0 ? [170, 143, 108] : w
                                    : g2 === G.GRASS && l(px, py) > .988 && (w = [135, 196, 95])
                        } else if (z >= 16.6 && z < 22.4) {
                            /* the boulevard continues east & west into the haze */
                            if (Math.abs(Math.abs(x) - 44) < 1.2)
                                w = Math.floor((z - 17.4) / 1.05) % 2 < 1 ? Gpal[G.ZEBRA].c[0] : Gpal[G.ASPH].c[0];
                            else if (Math.abs(z - 19.5) < .12 && (x + 124) % 4 < 2.4)
                                w = Gpal[G.LINE].c[0];
                            else
                                w = Gpal[G.ASPH].c[Math.floor(l(px, py) * 3)],
                                    l(px, py) > .975 && (w = [94, 96, 107])
                        } else if (Math.abs(x) >= 41 && Math.abs(x) <= 47 && z < 16.6 && z >= -108) {
                            /* north-south avenues */
                            w = Math.abs(Math.abs(x) - 44) < .12 && (z + 128) % 4 < 2.4 && !(z > -41.5 && z < -34.5)
                                ? Gpal[G.LINE].c[0]
                                : Gpal[G.ASPH].c[Math.floor(l(px, py) * 3)]
                        } else if ((Math.abs(x) >= 38.8 && Math.abs(x) < 41 || Math.abs(x) > 47 && Math.abs(x) <= 49.2) && z < 16.6 && z >= -108) {
                            w = Gpal[G.WALK].c[Math.floor(l(px, py) * 3)],
                                w = px % 8 === 0 || py % 8 === 0 ? [161, 156, 148] : w
                        } else if (z >= 11.8 && z < 16.6 && Math.abs(x) <= 116) {
                            w = z < 12.1 || z > 16.2 ? Gpal[G.CURB].c[0] : Gpal[G.WALK].c[Math.floor(l(px, py) * 3)]
                        } else if (z >= 22.4 && z < 26.2) {
                            w = z < 22.7 || z > 25.9 ? Gpal[G.CURB].c[0] : Gpal[G.WALK].c[Math.floor(l(px, py) * 3)]
                        } else if (z >= -41 && z <= -35 && Math.abs(x) <= 49) {
                            /* cross street behind the office */
                            if (Math.abs(x) >= 41.4 && Math.abs(x) <= 46.6)
                                w = Math.floor((Math.abs(x) - 41.4) / 1.05) % 2 < 1 ? Gpal[G.ZEBRA].c[0] : Gpal[G.ASPH].c[0];
                            else if (Math.abs(z + 38) < .12 && (x + 124) % 4 < 2.4)
                                w = Gpal[G.LINE].c[0];
                            else
                                w = Gpal[G.ASPH].c[Math.floor(l(px, py) * 3)]
                        } else if ((z >= -43 && z < -41 || z > -35 && z <= -33.2) && Math.abs(x) <= 49) {
                            w = Gpal[G.WALK].c[Math.floor(l(px, py) * 3)],
                                w = px % 8 === 0 || py % 8 === 0 ? [161, 156, 148] : w
                        } else if (z >= 68 && z <= 74 && Math.abs(x) <= 116) {
                            /* far downtown street */
                            w = Math.abs(z - 71) < .12 && (x + 124) % 4 < 2.4 ? Gpal[G.LINE].c[0] : Gpal[G.ASPH].c[Math.floor(l(px, py) * 3)]
                        } else if (z > 26.2 && Math.abs(x) <= 78) {
                            /* downtown blocks */
                            w = URB2[Math.floor(l(px >> 3, py >> 3) * URB2.length)],
                                px % 24 === 0 || py % 24 === 0 ? w = [172, 168, 160] : 0,
                                l(px >> 2, py >> 2) > .97 && (w = [138, 134, 126])
                        } else {
                            /* open grass — coarse + fine noise like the park */
                            let gr = l(px >> 1, py >> 1) * .6 + l(px, py) * .4;
                            w = Gpal[G.GRASS].c[Math.floor(gr * Gpal[G.GRASS].c.length)];
                            let fz = Math.hypot(x - 4, z + 58) < 26 || Math.hypot(x - 60, z + 4) < 14 || (x < -50 && x > -100 && z > -28 && z < 10);
                            if (fz && l(px + 7, py + 13) > .93)
                                w = FLW[Math.floor(l(px + 3, py + 5) * FLW.length)];
                            else if (l(px, py) > .988)
                                w = [135, 196, 95]
                        }
                        /* painted paths + pond bed override the base terrain */
                        if (mkd[E] > 100) {
                            w = GRV[Math.floor(l(px, py) * GRV.length)],
                                l(px, py) > .93 && (w = [168, 147, 108])
                        } else if (mkd[E + 2] > 100) {
                            let dx2 = (x - 4) / 9.5, dz2 = (z + 58) / 7, dd = dx2 * dx2 + dz2 * dz2;
                            w = dd < .5 ? [16, 32, 48] : [28, 56, 80],
                                l(px, py) > .9 && (w = [40, 70, 96])
                        }
                        /* the horizon band: dithered haze that dissolves into the sky */
                        let rr2 = Math.hypot(x, z + 4);
                        if (rr2 > 78) {
                            let hz = n((rr2 - 78) / 30 + (l(px >> 1, py) - .5) * .14, 0, 1);
                            w = [w[0] + (HAZE[0] - w[0]) * hz, w[1] + (HAZE[1] - w[1]) * hz, w[2] + (HAZE[2] - w[2]) * hz]
                        }
                        im.data[E] = Math.round(w[0]), im.data[E + 1] = Math.round(w[1]), im.data[E + 2] = Math.round(w[2]), im.data[E + 3] = 255
                    }
                }
                return cc.putImageData(im, 0, 0), h(cv)
            }

            var OUTER_TEX = paintOuter()
              , outerMat = new e.MeshStandardMaterial({ map: OUTER_TEX, roughness: 1, metalness: 0 });
            lampMats.push(outerMat);
            var outerLand = new e.Mesh(new e.PlaneGeometry(248, 248).rotateX(-Math.PI / 2), outerMat);
            outerLand.position.set(0, -.02, -4),
                outerLand.receiveShadow = !0,
                T.add(outerLand);

            /* ---- the pond: pomodoro-park water, with scene fog folded in ---- */
            var WATERS = [];
            {
                let wm = new e.ShaderMaterial({
                    uniforms: {
                        uTime: { value: 0 }, uRain: { value: .22 }, uGlow: { value: 0 }, uGlowK: { value: 0 },
                        uDeep: { value: new e.Color(`#14486a`) }, uShallow: { value: new e.Color(`#3f8fa6`) },
                        uSky: { value: new e.Color(`#9fd0ff`) }, uLamp: { value: new e.Color(0, 0, 0) },
                        uTint: { value: new e.Color(1, 1, 1) }, uFlow: { value: new e.Vector2(.05, -.03) },
                        uFogC: { value: new e.Color(`#8899aa`) }, uFogN: { value: 210 }, uFogF: { value: 320 }
                    },
                    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
                    fragmentShader: `uniform float uTime,uRain,uFogN,uFogF;uniform vec3 uDeep,uShallow,uSky,uLamp,uTint,uFogC;uniform vec2 uFlow;varying vec3 vW;
    float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec2 p=floor(vW.xz*8.)/8.;vec2 q=p+uFlow*uTime;
      float w1=sin(q.x*2.1+uTime*1.3+sin(q.y*1.7+uTime*.7)*1.5);
      float w2=sin(q.y*2.7-uTime*1.1+sin(q.x*1.3)*1.2);
      float wv=(w1+w2)*.5;
      vec3 col=mix(uDeep,uShallow,.5+.3*wv);
      col=mix(col,uSky,.22);
      float hl=step(.85,wv*.5+.5+(h21(p)-.5)*.16);
      col+=hl*(uSky*.35+uLamp);
      vec2 cell=floor(p/1.1);vec2 f=p-cell*1.1;vec2 cc2=vec2(h21(cell),h21(cell+7.))*.7+.2;
      float ph=fract(uTime*.85+h21(cell+3.));float ring=1.-smoothstep(0.,.07,abs(length(f-cc2)-ph*.5));
      col+=ring*(1.-ph)*uRain*.55*(uSky+.25);
      col=floor(col*14.)/14.;
      float ff=smoothstep(uFogN,uFogF,distance(vW,cameraPosition));
      col=mix(col,uFogC,ff);
      gl_FragColor=vec4(col*uTint,1.);}`
                });
                WATERS.push(wm);
                let mesh = new e.Mesh(new e.CircleGeometry(1, 26).rotateX(-Math.PI / 2), wm);
                mesh.scale.set(9.5, 1, 7),
                    mesh.position.set(HOOD.pond.x, .05, HOOD.pond.z),
                    T.add(mesh)
            }
            /* lily pads + blossoms */
            {
                let LILY = new e.MeshStandardMaterial({ color: `#3f7a33`, roughness: .9 })
                    , BLOOM = new e.MeshStandardMaterial({ color: `#f2a0b8`, roughness: .8 });
                for (let [lx2, lz2, lr] of [[1.6, -54, .16], [7, -56.5, .12], [.8, -60, .18], [8.4, -60.5, .13], [5.2, -62.5, .15]]) {
                    let pad = new e.Mesh(new e.CylinderGeometry(lr, lr * .92, .022, 7), LILY);
                    pad.position.set(lx2, .068, lz2),
                        T.add(pad),
                        Math.random() < .45 && (() => {
                            let bl = new e.Mesh(new e.BoxGeometry(.06, .05, .06), BLOOM);
                            bl.position.set(lx2 + .03, .1, lz2),
                                T.add(bl)
                        })()
                }
            }
            /* reeds along the bank */
            {
                for (let [rx2, rz2] of [[-4.5, -51.4], [11, -51.2], [13.2, -56], [-1.5, -65.1], [-9.2, -62], [12.4, -63.6]]) {
                    let cl = new e.Group;
                    cl.position.set(rx2, 0, rz2);
                    for (let k = 0; k < 3; k++) {
                        let h3 = a(.45, .85)
                            , st = new e.Mesh(new e.BoxGeometry(.045, h3, .045), M.leafDark);
                        st.position.set(a(-.1, .1), h3 / 2, a(-.1, .1)),
                            st.rotation.z = a(-.14, .14),
                            st.castShadow = !0,
                            cl.add(st),
                            k === 0 && Math.random() < .6 && (() => {
                                let tip = new e.Mesh(new e.BoxGeometry(.05, .09, .05), M.bark);
                                tip.position.set(st.position.x, h3 + .04, st.position.z),
                                    cl.add(tip)
                            })()
                    }
                    T.add(cl)
                }
            }
            /* wooden pier over the south bank */
            {
                let g = new e.Group;
                let deck = new e.Mesh(new e.BoxGeometry(1.05, .09, 5.6), M.bark);
                deck.position.set(4, .21, -54.2),
                    deck.castShadow = deck.receiveShadow = !0,
                    g.add(deck);
                for (let sz2 of [-1, 1])
                    for (let sz3 of [-2.55, 2.45]) {
                        let leg = new e.Mesh(new e.BoxGeometry(.09, .4, .09), M.bark);
                        leg.position.set(4 + sz2 * .42, .02, -54.2 + sz3),
                            g.add(leg)
                    }
                for (let sz2 of [-1, 1]) {
                    let post = new e.Mesh(new e.BoxGeometry(.07, .55, .07), M.bark);
                    post.position.set(4 + sz2 * .42, .5, -56.6),
                        post.castShadow = !0,
                        g.add(post)
                }
                T.add(g)
            }
            /* stone lanterns (park-style) */
            {
                let STONE = new e.MeshStandardMaterial({ color: `#a8aeb2`, roughness: .9 })
                    , LANT = new e.MeshStandardMaterial({ color: `#3a3f48`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .5 });
                nightGlow.push({ mat: LANT, k: 2.4, th: .5 });
                for (let [lx2, lz2] of HOOD.lanterns) {
                    let g = new e.Group;
                    g.position.set(lx2, 0, lz2);
                    let b1 = new e.Mesh(new e.BoxGeometry(.4, .16, .4), STONE);
                    b1.position.y = .08, b1.castShadow = !0, g.add(b1);
                    let b2 = new e.Mesh(new e.BoxGeometry(.15, .42, .15), STONE);
                    b2.position.y = .37, b2.castShadow = !0, g.add(b2);
                    let b3 = new e.Mesh(new e.BoxGeometry(.34, .2, .34), STONE);
                    b3.position.y = .68, g.add(b3);
                    let core = new e.Mesh(new e.BoxGeometry(.2, .12, .2), LANT);
                    core.position.y = .68, g.add(core);
                    let cap = new e.Mesh(new e.ConeGeometry(.26, .2, 4), STONE);
                    cap.position.y = .86, cap.rotation.y = Math.PI / 4, cap.castShadow = !0, g.add(cap);
                    let tip = new e.Mesh(new e.SphereGeometry(.045, 6, 5), STONE);
                    tip.position.y = .99, g.add(tip);
                    halo(lx2, .72, lz2, 1.15, `#ffcf9a`, .5);
                    T.add(g)
                }
            }
            /* park benches facing the pond + the north viewpoint */
            {
                for (let [bx2, bz2, ry2] of HOOD.parkBenches) {
                    let g = new e.Group;
                    g.position.set(bx2, 0, bz2), g.rotation.y = ry2;
                    let seat = new e.Mesh(new e.BoxGeometry(1.3, .07, .42), M.bark);
                    seat.position.y = .42, seat.castShadow = seat.receiveShadow = !0, g.add(seat);
                    let back = new e.Mesh(new e.BoxGeometry(1.3, .34, .06), M.bark);
                    back.position.set(0, .68, .2), g.add(back);
                    for (let s2 of [-1, 1]) {
                        let leg = new e.Mesh(new e.BoxGeometry(.07, .42, .38), M.metal);
                        leg.position.set(s2 * .55, .21, 0), g.add(leg)
                    }
                    T.add(g)
                }
            }
            /* one parked hatchback on the cross street */
            {
                let g = new e.Group;
                g.position.set(HOOD.parkedCar[0], 0, HOOD.parkedCar[1]), g.rotation.y = HOOD.parkedCar[2];
                let body = new e.Mesh(new e.BoxGeometry(1.95, .34, .92), new e.MeshStandardMaterial({ color: `#7a8a99`, roughness: .4, metalness: .2 }));
                body.position.y = .38, body.castShadow = !0, g.add(body);
                let cab = new e.Mesh(new e.BoxGeometry(1, .32, .8), new e.MeshStandardMaterial({ color: `#232a35`, roughness: .2, metalness: .4 }));
                cab.position.set(-.1, .68, 0), cab.castShadow = !0, g.add(cab);
                for (let sx2 of [-.6, .6])
                    for (let sz2 of [-.46, .46]) {
                        let wheel = new e.Mesh(new e.BoxGeometry(.26, .26, .12), M.cap);
                        wheel.position.set(sx2, .16, sz2), g.add(wheel)
                    }
                T.add(g)
            }
            /* street lamps along the extended boulevard */
            {
                for (let [lx2, lz2, ry2] of HOOD.lamps) {
                    let g = new e.Group;
                    g.position.set(lx2, 0, lz2), g.rotation.y = ry2;
                    let pole = new e.Mesh(new e.CylinderGeometry(.05, .07, 3, 6), M.metal);
                    pole.position.y = 1.5, pole.castShadow = !0, g.add(pole);
                    let arm = new e.Mesh(new e.BoxGeometry(.08, .08, 1), M.metal);
                    arm.position.set(0, 2.96, .5), g.add(arm);
                    let head = new e.Mesh(new e.BoxGeometry(.22, .1, .5), new e.MeshStandardMaterial({ color: `#2c313a`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .6 }));
                    head.position.set(0, 2.9, .95), g.add(head),
                        nightGlow.push({ mat: head.material, k: 2.2, th: .5 });
                    g.rotation.y ? halo(lx2 + Math.sin(ry2) * .95, 2.78, lz2 + Math.cos(ry2) * .95, 2.2, `#ffcf9a`, .5) : halo(lx2, 2.78, lz2 + .95, 2.2, `#ffcf9a`, .5);
                    T.add(g)
                }
            }

            /* ---- trees: sakura canopies (pomodoro-park style), pines, extra greenery ---- */
            function paletteTex(cols) {
                let cc2 = cols.map(d);
                return _(32, 32, (x, y) => cc2[Math.min(cc2.length - 1, Math.floor((l(x >> 1, y >> 1) * .65 + l(x, y) * .35) * cc2.length))])
            }
            var CHERRY_MAT = new e.MeshStandardMaterial({ map: h(paletteTex([`#e48aa8`, `#f0a4bd`, `#f7c1d2`, `#d97497`])), flatShading: !0, roughness: 1 })
              , PINE_MAT = new e.MeshStandardMaterial({ map: h(paletteTex([`#25553a`, `#2f6a45`, `#3b7c50`, `#1f4a33`])), flatShading: !0, roughness: 1 })
              , HILL_MAT = new e.MeshStandardMaterial({ map: h(texGrass()), color: `#a4bf98`, flatShading: !0, roughness: 1 })
              , ROCK_MAT = new e.MeshStandardMaterial({ color: `#8e9aac`, flatShading: !0, roughness: 1 })
              , SNOW_MAT = new e.MeshStandardMaterial({ color: `#edf2f8`, flatShading: !0, roughness: .8 })
              , CH = [];   /* cherry trees, the petal emitters */
            function cherryTree(x, z, s = 1) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let trunk = new e.Mesh(new e.BoxGeometry(.34 * s, 1.35 * s, .34 * s), M.bark);
                trunk.position.y = .68 * s, trunk.castShadow = !0, g.add(trunk);
                let crown = new e.Group;
                crown.position.y = 1.32 * s, g.add(crown);
                for (let [ox, oy, oz, r2] of [[0, .62, 0, 1.02], [.58, .28, .3, .72], [-.55, .42, -.2, .66], [.1, 1.08, -.1, .6]]) {
                    let blob = new e.Mesh(new e.IcosahedronGeometry(r2 * s, 1), CHERRY_MAT);
                    blob.position.set(ox * s, oy * s, oz * s),
                        blob.rotation.set(a(0, 3), a(0, 3), 0),
                        blob.castShadow = !0,
                        crown.add(blob)
                }
                kt.push({ crown, ph: a(0, c), x, z, s }),   /* sways with the existing wind pass */
                    CH.push({ x, z, y: 2.3 * s, r: 1.15 * s, s });
                T.add(g)
            }
            function pineTree(x, z, s = 1) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let trunk = new e.Mesh(new e.BoxGeometry(.2 * s, .5 * s, .2 * s), M.bark);
                trunk.position.y = .25 * s, g.add(trunk);
                let crown = new e.Group;
                crown.position.y = .45 * s, g.add(crown);
                for (let k = 0; k < 3; k++) {
                    let cone = new e.Mesh(new e.ConeGeometry((0.95 - k * .24) * s, 1.05 * s, 7), PINE_MAT);
                    cone.position.y = (.5 + k * .62) * s, cone.castShadow = !1, crown.add(cone)
                }
                kt.push({ crown, ph: a(0, c), x, z, s });
                T.add(g)
            }
            HOOD.cherries.forEach(([tx, tz, ts]) => cherryTree(tx, tz, ts));
            HOOD.greenTrees.forEach(([tx, tz, ts]) => {
                tree(tx, tz, ts);
                LEAF_TREES.push({ x: tx, z: tz, y: 2.05 * ts, r: .95 * ts })
            });
            HOOD.pines.forEach(([tx, tz, ts]) => pineTree(tx, tz, ts));

            /* ---- cosy houses for the courts & parkettes ---- */
            var HOUSE_WALLS = [`#e8dcc0`, `#cdd6c0`, `#c3d1dc`, `#dcbfa8`].map(cc2 => new e.MeshStandardMaterial({ color: cc2, roughness: .9 }))
              , HOUSE_ROOFS = [`#b5544a`, `#5f6b78`, `#8a6a4f`, `#4a5568`].map(cc2 => new e.MeshStandardMaterial({ color: cc2, roughness: .85, flatShading: !0 }))
              , HOUSE_DOOR = new e.MeshStandardMaterial({ color: `#5a4030`, roughness: .8 })
              , WINMAT = new e.MeshStandardMaterial({ color: `#33404f`, emissive: `#ffd9a0`, emissiveIntensity: 0, roughness: .35 });
            nightGlow.push({ mat: WINMAT, k: 1.6, th: .5 });
            function house(x, z, ry, pi) {
                let g = new e.Group;
                g.position.set(x, 0, z), g.rotation.y = ry;
                let base = new e.Mesh(new e.BoxGeometry(4.4, 2.6, 3.6), HOUSE_WALLS[pi]);
                base.position.y = 1.3, base.castShadow = base.receiveShadow = !0, g.add(base);
                let roof = new e.Mesh(new e.ConeGeometry(3.55, 1.5, 4), HOUSE_ROOFS[(pi + 1) % 4]);
                roof.position.y = 3.35, roof.rotation.y = Math.PI / 4, roof.castShadow = !0, g.add(roof);
                let door = new e.Mesh(new e.BoxGeometry(.72, 1.3, .1), HOUSE_DOOR);
                door.position.set(.2, .65, 1.82), g.add(door);
                let knob = new e.Mesh(new e.SphereGeometry(.03, 6, 5), M.metal);
                knob.position.set(.46, .68, 1.9), g.add(knob);
                for (let wx of [-1.5, 1.45]) {
                    let win = new e.Mesh(new e.BoxGeometry(.6, .62, .08), WINMAT);
                    win.position.set(wx, 1.4, 1.82), g.add(win);
                    let sill = new e.Mesh(new e.BoxGeometry(.7, .06, .16), HOUSE_DOOR);
                    sill.position.set(wx, 1.06, 1.84), g.add(sill)
                }
                for (let sx3 of [-1, 1]) {
                    let win = new e.Mesh(new e.BoxGeometry(.08, .55, .6), WINMAT);
                    win.position.set(sx3 * 2.21, 1.45, -.3), g.add(win)
                }
                if (pi === 1 || pi === 2) {
                    let chim = new e.Mesh(new e.BoxGeometry(.32, 1.1, .32), HOUSE_ROOFS[2]);
                    chim.position.set(1.15, 3.6, .45), g.add(chim)
                }
                if (pi < 2) {   /* little shrubs by the door */
                    for (let bx3 of [-1.1, 1.9]) {
                        let shrub = new e.Mesh(new e.BoxGeometry(.5, .42, .5), M.leafDark);
                        shrub.position.set(bx3, .21, 2.2), shrub.castShadow = !0, g.add(shrub)
                    }
                }
                T.add(g)
            }
            HOOD.houses.forEach(([hx, hz, hry, hpi]) => house(hx, hz, hry, hpi));
            /* chimney smoke drifting off the west cottage */
            var SMOKE = [];
            for (let i = 0; i < 5; i++) {
                let sp = new e.Sprite(new e.SpriteMaterial({ map: ze, color: `#dfe2e8`, transparent: !0, opacity: 0, depthWrite: !1 }));
                sp.position.set(-70.9, 3.9, -52.6),
                    sp.scale.setScalar(.5),
                    T.add(sp),
                    SMOKE.push({ spr: sp, ph: i / 5 })
            }

            /* ---- hills ring + far mountains, standing in the haze band ---- */
            function hillMound(x, z, r2, h3) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let m1 = new e.Mesh(new e.CylinderGeometry(r2 * .98, r2 * 1.22, h3 * .62, 8, 1), HILL_MAT);
                m1.position.y = h3 * .31, g.add(m1);
                let m2 = new e.Mesh(new e.CylinderGeometry(r2 * .5, r2 * .72, h3 * .5, 8, 1), HILL_MAT);
                m2.position.y = h3 * .87, g.add(m2);
                T.add(g)
            }
            function mountain(x, z, r2, h3) {
                let g = new e.Group;
                g.position.set(x, 0, z);
                let cone = new e.Mesh(new e.ConeGeometry(r2, h3, 6), ROCK_MAT);
                cone.position.y = h3 / 2, cone.rotation.y = a(0, 1), g.add(cone);
                let snow = new e.Mesh(new e.ConeGeometry(r2 * .38, h3 * .34, 6), SNOW_MAT);
                snow.position.y = h3 - h3 * .17, snow.rotation.y = cone.rotation.y, g.add(snow);
                T.add(g)
            }
            for (let [A, rr3, h3] of [[170, 84, 9], [195, 88, 12], [220, 82, 7], [245, 86, 11], [270, 84, 13], [295, 87, 9], [320, 83, 7], [345, 86, 10], [10, 84, 8]]) {
                let A2 = A * Math.PI / 180;
                hillMound(rr3 * Math.cos(A2), -4 + rr3 * Math.sin(A2), 4.5 + A % 5, h3)
            }
            for (let [A, rr3, r2, h3] of [[180, 100, 9, 26], [205, 103, 8, 20], [232, 99, 10, 30], [258, 102, 9, 24], [285, 100, 10, 32], [312, 103, 8, 22], [338, 101, 9, 27], [8, 99, 8, 18]]) {
                let A2 = A * Math.PI / 180;
                mountain(rr3 * Math.cos(A2), -4 + rr3 * Math.sin(A2), r2, h3)
            }
            /* signature peaks that rise through the haze along the default sight-line,
               so the hero view ends in misty mountains behind the cherry park */
            mountain(-49, -88, 10, 24);
            mountain(-36, -97, 9, 30);
            mountain(-20, -86, 7, 16);
            mountain(-28, -74, 8, 22);
            hillMound(-42, -70, 5.5, 9);

            /* ---- sakura petals fluttering down from every cherry tree ---- */
            var PTL_N = 100
              , ptlPts = makePts(PTL_N, !1, !0)
              , ptlSt = []
              , PETAL_COLS = [`#f7c1d2`, `#f0a4bd`, `#ffe3ec`, `#e48aa8`].map(cc2 => new e.Color(cc2));
            function petalSpawn(i, first) {
                let st = ptlSt[i]
                    , tr = st.tr = s(HOOD.cherries)
                    , ang = a(0, c)
                    , rr4 = Math.sqrt(Math.random()) * 1.15 * tr[2];
                ptlPts.pos[i * 3] = tr[0] + Math.cos(ang) * rr4;
                ptlPts.pos[i * 3 + 1] = first ? a(.4, 3) * tr[2] : a(1.7, 2.9) * tr[2];
                ptlPts.pos[i * 3 + 2] = tr[1] + Math.sin(ang) * rr4;
                ptlPts.alp[i] = 0;
                let pc2 = s(PETAL_COLS);
                ptlPts.col[i * 3] = pc2.r, ptlPts.col[i * 3 + 1] = pc2.g, ptlPts.col[i * 3 + 2] = pc2.b
            }
            for (let i = 0; i < PTL_N; i++) {
                ptlSt.push({ ph: a(0, c), rest: 0, tr: null });
                ptlPts.size[i] = a(.07, .13);
                petalSpawn(i, !0)
            }
            function updPetals(dt, tm) {
                let wind = .5 + Math.sin(tm * .13) * .35;
                for (let i = 0; i < PTL_N; i++) {
                    let st = ptlSt[i], k = i * 3;
                    if (st.rest > 0) {
                        st.rest -= dt;
                        ptlPts.alp[i] = Math.min(1, st.rest);
                        st.rest <= 0 && petalSpawn(i, !1);
                        continue
                    }
                    ptlPts.alp[i] = Math.min(1, ptlPts.alp[i] + dt * 2);
                    let ph = st.ph + tm * 1.3;
                    ptlPts.pos[k] += (wind * 1.3 + Math.sin(ph) * .45) * dt;
                    ptlPts.pos[k + 1] += (-.38 - Math.sin(ph * 1.7) * .12) * dt;
                    ptlPts.pos[k + 2] += (Math.cos(ph * .8) * .35 + wind * .35) * dt;
                    ptlPts.pos[k + 1] < .04 && (ptlPts.pos[k + 1] = .04, st.rest = a(4, 10));
                    Math.hypot(ptlPts.pos[k], ptlPts.pos[k + 2] + 4) > 90 && petalSpawn(i, !1)
                }
                ptlPts.commit()
            }

            /* ---- butterflies over the flower beds (daytime only) ---- */
            var BF_ANCH = [
                [4, -50.5], [12, -53.5], [-6, -55], [-11, -61.5], [16, -62], [4, -69.5],
                [-9.5, 12.2], [9.5, 12.2], [34.5, 11.4], [-34.5, 11.4], [62, 11.4], [-62, 11.4],
                [58, 4.6], [64, -9], [-60, 4], [-66, -1.5], [-56.5, -15]
            ]
              , BF_SPECIES = [
                    { a: `#e8873c`, b: `#f2b04c`, sp: `#3a2a20` },   /* monarch */
                    { a: `#f2a0b8`, b: `#f7c8d8`, sp: `#e45a8a` },   /* sakura pink */
                    { a: `#7aa8e8`, b: `#a8c8f0`, sp: `#3a5a9a` },   /* morpho-ish */
                    { a: `#f2e6a8`, b: `#f7f0c8`, sp: `#c8a03a` }    /* lemon */
                ]
              , bflies = [];
            function bflyTex(P) {
                let cv2 = m(32, 12), cx3 = cv2.getContext(`2d`);
                for (let fr = 0; fr < 2; fr++) {
                    let ox = fr * 16;
                    if (fr === 0) {   /* wings spread */
                        v(cx3, ox + 2, 1, 5, 5, P.a), v(cx3, ox + 9, 1, 5, 5, P.a);
                        v(cx3, ox + 1, 4, 6, 5, P.b), v(cx3, ox + 9, 4, 6, 5, P.b);
                        v(cx3, ox + 3, 2, 2, 2, P.sp), v(cx3, ox + 11, 2, 2, 2, P.sp)
                    } else {          /* wings folded */
                        v(cx3, ox + 6, 1, 4, 4, P.a), v(cx3, ox + 7, 1, 4, 8, P.b)
                    }
                    v(cx3, ox + 7, 3, 2, 7, `#2a2228`);         /* body */
                    v(cx3, ox + 7, 1, 1, 2, `#2a2228`);          /* head */
                    v(cx3, ox + 6, 0, 1, 1, `#2a2228`), v(cx3, ox + 9, 0, 1, 1, `#2a2228`)   /* antennae */
                }
                return h(b(cv2))
            }
            {
                let BFGEO = new e.PlaneGeometry(16 * .028, 12 * .028);
                BFGEO.translate(0, 12 * .028 / 2, 0);
                for (let i = 0; i < 12; i++) {
                    let spec = BF_SPECIES[i % 4]
                        , mat2 = new e.MeshBasicMaterial({ map: bflyTex(spec), transparent: !0, opacity: 0, alphaTest: .05, side: e.DoubleSide, depthWrite: !1 })
                        , mesh = new e.Mesh(BFGEO, mat2);
                    mesh.rotation.order = `YXZ`,
                        mesh.renderOrder = 6,
                        T.add(mesh);
                    let home = BF_ANCH[i % BF_ANCH.length];
                    bflies.push({
                        mesh, mat: mat2, home,
                        anchors: BF_ANCH.filter(p2 => Math.hypot(p2[0] - home[0], p2[1] - home[1]) < 19),
                        tx: home[0] + a(-1.5, 1.5), tz: home[1] + a(-1.5, 1.5), ty: a(.6, 1.4),
                        ph: a(0, c), f1: a(.5, 1.1), sp: a(.7, 1.2),
                        mode: 0, t: a(0, 3)
                    });
                    mesh.position.set(bflies[i].tx, bflies[i].ty, bflies[i].tz)
                }
            }
            function updBflies(dt, tm) {
                let day = Z.day;
                for (let b of bflies) {
                    b.mat.opacity = n((day - .25) / .45, 0, 1) * .95;
                    if (b.mat.opacity < .02) continue;
                    b.t -= dt;
                    if (b.t <= 0) {
                        if (b.mode === 0 && Math.random() < .3)
                            b.mode = 2, b.t = a(2.5, 5);   /* settle on a flower */
                        else {
                            let anc = s(b.anchors.length ? b.anchors : [b.home]);
                            b.tx = anc[0] + a(-1.6, 1.6), b.tz = anc[1] + a(-1.6, 1.6),
                                b.ty = a(.55, 1.5), b.mode = 1, b.t = a(2.5, 6)
                        }
                    }
                    let M3 = b.mesh.position;
                    if (b.mode === 2) {
                        M3.y += (.32 - M3.y) * Math.min(1, dt * 2.4);
                        b.mat.map.offset.x = Math.floor(tm * 2.4 + b.ph) % 2 / 2
                    } else {
                        let dx = b.tx - M3.x, dy = b.ty - M3.y, dz = b.tz - M3.z
                            , d2 = Math.hypot(dx, dy, dz);
                        if (d2 > .08) {
                            let spm = Math.min(d2 * 1.8, 1.15) * b.sp * dt;
                            M3.x += dx / d2 * spm, M3.y += dy / d2 * spm, M3.z += dz / d2 * spm
                        } else
                            b.mode === 1 && Math.random() < dt * .35 && (b.mode = 0, b.t = a(1.5, 4));
                        M3.y += Math.sin(tm * 3 * b.f1 + b.ph) * .0022;
                        b.mat.map.offset.x = Math.floor(tm * (8.5 * b.sp) + b.ph) % 2 / 2
                    }
                    b.mesh.rotation.set(-.85, se, 0)
                }
            }

            /* ---- birds circling above the office & the park (daytime) ---- */
            function birdTex(c1, c2) {
                let cv2 = m(32, 10), cx3 = cv2.getContext(`2d`);
                for (let fr = 0; fr < 2; fr++) {
                    let ox = fr * 16, up2 = fr === 0;
                    up2 ? (v(cx3, ox + 2, 0, 4, 4, c2), v(cx3, ox + 9, 0, 4, 4, c2))
                        : (v(cx3, ox + 2, 5, 4, 3, c2), v(cx3, ox + 9, 5, 4, 3, c2));
                    v(cx3, ox + 5, up2 ? 1 : 4, 6, 3, c1);
                    v(cx3, ox + 10, up2 ? 2 : 4, 3, 2, c1);
                    v(cx3, ox + 12, up2 ? 3 : 5, 1, 1, `#e8a03a`);
                    v(cx3, ox + 11, up2 ? 2 : 4, 1, 1, `#2a1d1d`);
                    v(cx3, ox + 3, up2 ? 4 : 3, 2, 2, c1)
                }
                return h(b(cv2))
            }
            var BIRD_KINDS = [[`#8a92a0`, `#b8c0cc`], [`#a8835c`, `#c8a078`], [`#d84a4a`, `#e87a7a`]]
              , birds = [];
            {
                let BGEO2 = new e.PlaneGeometry(16 * .05, 10 * .05);
                BGEO2.translate(0, 10 * .05 / 2, 0);
                for (let i = 0; i < 6; i++) {
                    let cols = BIRD_KINDS[i % 3]
                        , mat2 = new e.MeshBasicMaterial({ map: birdTex(cols[0], cols[1]), transparent: !0, opacity: 0, alphaTest: .05, side: e.DoubleSide, depthWrite: !1 })
                        , mesh = new e.Mesh(BGEO2, mat2);
                    mesh.rotation.order = `YXZ`,
                        mesh.renderOrder = 6,
                        T.add(mesh);
                    birds.push({
                        mesh, mat: mat2,
                        cx: i % 2 ? 2 : -4, cz: i % 2 ? -56 : -2,
                        r: a(10, 18), h: a(15, 24), A: a(0, c),
                        w: a(.14, .26) * (i % 2 ? 1 : -1), ph: a(0, c)
                    })
                }
            }
            function updBirds(dt, tm) {
                for (let b of birds) {
                    b.mat.opacity = n((Z.day - .2) / .4, 0, 1) * .92;
                    if (b.mat.opacity < .02) continue;
                    b.A += b.w * dt;
                    let rr5 = b.r + Math.sin(tm * .23 + b.ph) * 2.5;
                    b.mesh.position.set(b.cx + Math.cos(b.A) * rr5, b.h + Math.sin(tm * .9 + b.ph) * .8, b.cz + Math.sin(b.A) * rr5 * .8);
                    b.mat.map.offset.x = Math.floor(tm * 6 + b.ph) % 2 / 2;
                    b.mesh.rotation.set(-.55, se, 0)
                }
            }

            /* AC units outside */
            {
                let g = new e.Group;
                g.position.set(18.4, 1.9, -8);
                let box2 = new e.Mesh(new e.BoxGeometry(.5, .6, .9), M.metal);
                box2.castShadow = !0,
                g.add(box2);
                let fanG = new e.Group;
                fanG.position.set(.26, 0, 0);
                let ring = new e.Mesh(new e.TorusGeometry(.19, .028, 6, 14), M.cap);
                fanG.add(ring);
                for (let i = 0; i < 4; i++) {
                    let bl = new e.Mesh(new e.BoxGeometry(.035, .3, .055), M.cap);
                    bl.rotation.z = i * Math.PI / 2 + .4,
                    bl.rotation.y = .5,
                    fanG.add(bl)
                }
                g.add(fanG),
                fans.push(fanG),
                T.add(g)
            }

            /* ================= CITY ================= */

            function cityTex(w, h2, seed) {
                let cols = Math.max(2, Math.round(w * 1.1))
                  , rows = Math.max(3, Math.round(h2 * 1.5))
                  , cw = Math.floor(44 / cols)
                  , ch2 = Math.floor(64 / rows)
                  , base = s([`#8a8f9c`, `#9aa0a8`, `#7d828e`, `#a8a4b0`, `#6e7480`, `#94849a`]);
                let day = m(44, 64), dctx = day.getContext(`2d`);
                let nite = m(44, 64), nctx = nite.getContext(`2d`);
                dctx.fillStyle = base,
                dctx.fillRect(0, 0, 44, 64),
                nctx.fillStyle = `#000`,
                nctx.fillRect(0, 0, 44, 64);
                for (let r = 0; r < rows; r++)
                    for (let c = 0; c < cols; c++) {
                        let x = c * cw + 1, y = r * ch2 + 2
                          , w2 = cw - 2, h3 = ch2 - 3
                          , v = l(seed + c, r);
                        dctx.fillStyle = v > .5 ? `#46525f` : `#3c4650`,
                        v > .93 && (dctx.fillStyle = `#5d6a78`),
                        dctx.fillRect(x, y, w2, h3);
                        if (l(seed + c * 3, r * 7) < .38) {
                            let warm = l(c, r + seed) < .75;
                            nctx.fillStyle = warm ? `#ffd9a0` : `#bcd8ff`,
                            nctx.fillRect(x, y, w2, h3),
                            nctx.fillStyle = `rgba(255,255,255,.25)`,
                            nctx.fillRect(x, y, w2, 2)
                        }
                    }
                dctx.fillStyle = `#565c68`,
                dctx.fillRect(0, 0, 44, 2);
                return { day: h(day), nite: h(nite) }
            }

            function city(x, z, w, h2, seed) {
                let tex = cityTex(w, h2, seed)
                  , mat = new e.MeshStandardMaterial({ map: tex.day, emissiveMap: tex.nite, emissive: `#ffffff`, emissiveIntensity: 0, roughness: .9 });
                let b = new e.Mesh(new e.BoxGeometry(w, h2, w * .8), mat);
                b.position.set(x, h2 / 2, z),
                b.castShadow = b.receiveShadow = !0,
                T.add(b),
                nightGlow.push({ mat, k: 1.15, th: .5 });
                let cap = new e.Mesh(new e.BoxGeometry(w + .3, .35, w * .8 + .3), M.cap);
                cap.position.set(x, h2 + .17, z),
                cap.castShadow = !0,
                T.add(cap);
                if (l(seed, 5) > .5) {
                    let ant = new e.Mesh(new e.BoxGeometry(.12, 1.4, .12), M.metal);
                    ant.position.set(x + w * .2, h2 + .9, z),
                    T.add(ant)
                }
            }
            /* the downtown now stands on the new outer land — a layered skyline fading into the haze */
            city(-28, 31.5, 9, 6.5, 3), city(-14.5, 32, 8, 5.5, 7), city(-1, 31.5, 10, 7, 11),
            city(12, 32.5, 8.5, 6, 5), city(26.5, 31.5, 9, 6.5, 9);
            city(-44, 32, 10, 6, 13), city(42.5, 32, 9.5, 7, 17);
            city(-24, 45, 14, 13, 21), city(-1, 46, 17, 14.5, 24), city(22, 45, 14, 12, 27);
            city(-44, 46, 13, 11, 19), city(44, 46, 13, 12, 23);
            city(-26, 60, 13, 14, 29), city(-1, 60.5, 15, 15, 31), city(24, 60, 13, 13, 27), city(46, 59, 11, 11, 25), city(-52, 58, 10, 10, 26);
            /* far slab towers rising out of the haze band */
            city(-16, 80, 9, 24, 33), city(8, 82, 9, 26, 35), city(30, 80, 8, 22, 37), city(-38, 82, 8, 20, 39), city(52, 80, 8, 18, 41);

            /* ================= CARS ================= */

            var cars = [];
            function car(color, lane, dir) {
                let g = new e.Group;
                let body = new e.Mesh(new e.BoxGeometry(1.95, .34, .92), new e.MeshStandardMaterial({ color, roughness: .4, metalness: .2 }));
                body.position.y = .38,
                body.castShadow = !0,
                g.add(body);
                let cab = new e.Mesh(new e.BoxGeometry(1, .32, .8), new e.MeshStandardMaterial({ color: `#232a35`, roughness: .2, metalness: .4 }));
                cab.position.set(-.1, .68, 0),
                cab.castShadow = !0,
                g.add(cab);
                for (let sx of [-.6, .6])
                    for (let sz of [-.46, .46]) {
                        let wheel = new e.Mesh(new e.BoxGeometry(.26, .26, .12), M.cap);
                        wheel.position.set(sx, .16, sz),
                        g.add(wheel)
                    }
                let hm = new e.MeshStandardMaterial({ color: `#fff7dd`, emissive: `#fff0c0`, emissiveIntensity: 0 });
                let tm = new e.MeshStandardMaterial({ color: `#5a1a1a`, emissive: `#ff4444`, emissiveIntensity: 0 });
                for (let s of [-1, 1]) {
                    let hl = new e.Mesh(new e.BoxGeometry(.06, .1, .16), hm);
                    hl.position.set(dir * .98, .42, s * .3),
                    g.add(hl);
                    let tl = new e.Mesh(new e.BoxGeometry(.05, .09, .14), tm);
                    tl.position.set(-dir * .98, .44, s * .3),
                    g.add(tl)
                }
                return nightGlow.push({ mat: hm, k: 2.4, th: .5 }, { mat: tm, k: 1.8, th: .55 }),
                g.userData = { hm, tm },
                cars.push({ g, lane, dir, x: a(-112, 112), v: (3.6 + a(0, 2.2)) * dir }),
                T.add(g),
                g
            }
            [[`#d95d5d`, 17.9, 1], [`#2f6bd8`, 17.9, 1], [`#f2b84b`, 21.3, -1], [`#5e9e6e`, 21.3, -1], [`#e8e4da`, 17.9, 1]]
                .forEach(([c2, lane, dir]) => car(c2, lane, dir));
            /* ================= PEOPLE ================= */

            var cn = .06
              , SKINS = [`#f6d2b8`, `#eab792`, `#cf9670`, `#a86b48`, `#7a4a30`, `#ffe1cc`]
              , HAIRS = [`#2b1d16`, `#5a3825`, `#d9a441`, `#a8432c`, `#ece4d6`, `#3b3b56`, `#e783a8`, `#6fa8d6`, `#1f1f2a`, `#c8c8cf`]
              , SHIRTS = [`#e8735f`, `#f2b84b`, `#7cc4a4`, `#6a9fd8`, `#c58ad8`, `#f2f0e6`, `#e88aa8`, `#5e9e6e`, `#ffcf8a`, `#8fb8ff`, `#d95d5d`, `#4b6584`, `#6e7480`]
              , PANTS = [`#3b4a6b`, `#2e2e38`, `#6b5040`, `#4f6b5a`, `#7a6a92`, `#9c8b6e`, `#2f4858`, `#4a4a54`]
              , SHOES = [`#2a2228`, `#5a3a2a`, `#e8e4da`, `#8a2f2f`, `#454b56`];

            function personParams(over = {}) {
                return Object.assign({
                    skin: s(SKINS),
                    hair: s(HAIRS),
                    shirt: s(SHIRTS),
                    pants: s(PANTS),
                    shoe: s(SHOES),
                    style: s([`short`, `long`, `bun`, `curly`, `short`, `cap`, `ponytail`]),
                    cap: s([`#d95d5d`, `#4b6584`, `#f2b84b`, `#5e9e6e`]),
                    glasses: Math.random() < .28,
                    suit: null,
                    tie: null,
                    headset: !1
                }, over)
            }

            /* draw one 16x24 frame at ox */
            function drawPerson(ctx, ox, fr, P) {
                let skin = P.skin
                  , shirt = P.suit || P.shirt
                  , shirtD = p(shirt, .78)
                  , pants = P.pants
                  , pantsD = p(pants, .75);
                let sit = fr >= 6 && fr <= 9
                  , bob = fr & 1 ? 1 : 0
                  , c = sit ? 4 + bob : bob
                  , walk = fr >= 2 && fr <= 5
                  , h = walk ? [1, 0, -1, 0][fr - 2] : 0;

                /* legs */
                if (sit) {
                    v(ctx, ox + 5, c + 16, 8, 2, pants),
                    v(ctx, ox + 11, 22, 2, 1, pants),
                    v(ctx, ox + 11, 23, 3, 1, P.shoe)
                } else {
                    let leg = (x, n, col) => {
                        v(ctx, ox + x, c + 16, 3, 3, col),
                        v(ctx, ox + x + n, c + 19, 3, 3, col),
                        v(ctx, ox + x + n, 22, 3 + (n > 0 ? 1 : 0), 2, P.shoe)
                    };
                    leg(5, h, pantsD),
                    leg(8, -h, pants)
                }
                /* torso */
                v(ctx, ox + 5, c + 9, 6, 7, shirt),
                v(ctx, ox + 5, c + 9, 1, 7, shirtD),
                v(ctx, ox + 5, c + 15, 6, 1, shirtD);
                if (P.suit) {
                    v(ctx, ox + 7, c + 9, 2, 6, `#f2f0e6`),
                    v(ctx, ox + 7, c + 9, 1, 5, P.tie || `#c8483e`),
                    v(ctx, ox + 7, c + 8, 2, 1, P.tie || `#c8483e`)
                }
                /* arms */
                if (walk) {
                    v(ctx, ox + 4, c + 10 - h, 2, 5, shirtD),
                    v(ctx, ox + 4, c + 15 - h, 2, 1, skin),
                    v(ctx, ox + 10, c + 10 + h, 2, 5, shirtD),
                    v(ctx, ox + 10, c + 15 + h, 2, 1, skin)
                } else if (sit) {
                    if (fr === 6) {
                        v(ctx, ox + 9, c + 10, 2, 3, shirt),
                        v(ctx, ox + 10, c + 12, 3, 2, shirt),
                        v(ctx, ox + 12, c + 12, 1, 2, skin)
                    } else if (fr === 7) {
                        v(ctx, ox + 9, c + 10, 2, 3, shirt),
                        v(ctx, ox + 11, c + 9 - bob, 2, 3, `#f5f2ea`),
                        v(ctx, ox + 11, c + 9 - bob, 2, 1, `#7b4a2a`),
                        v(ctx, ox + 12, c + 11, 1, 1, skin)
                    } else {
                        let hy = fr === 9 ? -1 : 0;
                        v(ctx, ox + 9, c + 11, 2, 2, shirt),
                        v(ctx, ox + 11, c + 12 + hy, 3, 2, shirt),
                        v(ctx, ox + 13, c + 12 + hy, 1, 2, skin)
                    }
                } else if (fr === 10 || fr === 11) {
                    let hy = fr === 11 ? -1 : 0;
                    v(ctx, ox + 4, c + 10, 2, 5, shirtD),
                    v(ctx, ox + 4, c + 15, 2, 1, skin),
                    v(ctx, ox + 9, c + 10, 2, 3, shirt),
                    v(ctx, ox + 11, c + 11 + hy, 3, 2, shirt),
                    v(ctx, ox + 13, c + 11 + hy, 1, 2, skin)
                } else {
                    v(ctx, ox + 4, c + 10, 2, 5, shirtD),
                    v(ctx, ox + 4, c + 15, 2, 1, skin),
                    v(ctx, ox + 10, c + 10, 2, 5, shirtD);
                    if (fr >= 12) {
                        v(ctx, ox + 11, c + 6 - bob, 2, 3, `#f5f2ea`),
                        v(ctx, ox + 11, c + 6 - bob, 2, 1, `#7b4a2a`),
                        v(ctx, ox + 11, c + 9, 1, 1, skin)
                    } else
                        v(ctx, ox + 10, c + 15, 2, 1, skin)
                }
                /* head */
                v(ctx, ox + 5, c + 2, 7, 7, skin);
                let eyeY = c + 5 + (fr >= 8 && fr <= 11 ? 1 : 0);
                v(ctx, ox + 9, eyeY, 1, 1, `#2a1d1d`),
                v(ctx, ox + 11, eyeY, 1, 1, `#2a1d1d`),
                v(ctx, ox + 10, c + 7, 1, 1, p(skin, .85));
                if (P.glasses) {
                    v(ctx, ox + 8, eyeY, 4, 1, `#2a2a2a`),
                    v(ctx, ox + 9, eyeY, 1, 1, `#9ec9ff`)
                }
                /* hair */
                let g = P.hair;
                switch (P.style) {
                    case `bald`:
                        break;
                    case `buzz`:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 6, c + 3, 5, 1, g);
                        break;
                    case `messy`:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 5, c + 0, 2, 2, g),
                        v(ctx, ox + 8, c + 0, 2, 2, g),
                        v(ctx, ox + 11, c + 0, 1, 2, g);
                        break;
                    case `long`:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 4, c + 2, 3, 8, g);
                        break;
                    case `bun`:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 5, c + 3, 2, 2, g),
                        v(ctx, ox + 3, c + 1, 3, 3, g);
                        break;
                    case `curly`:
                        v(ctx, ox + 4, c + 0, 8, 3, g),
                        v(ctx, ox + 4, c + 3, 2, 3, g),
                        v(ctx, ox + 12, c + 1, 1, 1, g);
                        break;
                    case `cap`:
                        v(ctx, ox + 5, c + 1, 7, 2, P.cap),
                        v(ctx, ox + 10, c + 3, 3, 1, P.cap),
                        v(ctx, ox + 5, c + 3, 2, 2, g);
                        break;
                    case `ponytail`:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 4, c + 0, 2, 2, g),
                        v(ctx, ox + 3, c + 2, 2, 5, g);
                        break;
                    default:
                        v(ctx, ox + 5, c + 1, 7, 2, g),
                        v(ctx, ox + 5, c + 3, 2, 2, g)
                }
                if (P.headset) {
                    v(ctx, ox + 4, c + 0, 8, 1, `#2a2a30`),
                    v(ctx, ox + 4, c + 1, 1, 4, `#2a2a30`),
                    v(ctx, ox + 12, c + 1, 1, 3, `#2a2a30`),
                    v(ctx, ox + 12, c + 4, 1, 1, `#c8483e`)
                }
            }

            var PFRAMES = 14;
            function makeSheet(P) {
                let t = m(16 * PFRAMES, 24)
                  , n = t.getContext(`2d`);
                for (let r = 0; r < PFRAMES; r++)
                    drawPerson(n, r * 16, r, P);
                return { canvas: b(t), frames: PFRAMES, fw: 16, fh: 24 }
            }

            /* geometry shared by all people */
            var PGEO = new e.PlaneGeometry(16 * cn, 24 * cn);
            PGEO.translate(0, 24 * cn / 2, 0);
            var RGEO = new e.CircleGeometry(.3, 12).rotateX(-Math.PI / 2)
              , RBLOB = new e.MeshBasicMaterial({ color: 0, transparent: !0, opacity: .26, depthWrite: !1 })
              , BGEO = new e.PlaneGeometry(.72, .72)
              , TEXT_BGEO = new e.PlaneGeometry(3.2, 1.4);

            var PERS = []
              , personMats = []
              , spriteMeshes = [];

            var Person = class {
                constructor(P, meta) {
                    this.params = P;
                    this.sheet = makeSheet(P);
                    this.tex = h(this.sheet.canvas),
                    this.tex.repeat.set(1 / this.sheet.frames, 1);
                    this.mat = new e.MeshBasicMaterial({ map: this.tex, alphaTest: .5, side: e.DoubleSide });
                    personMats.push(this.mat);
                    this.group = new e.Group,
                    T.add(this.group);
                    this.sprite = new e.Mesh(PGEO, this.mat);
                    this.sprite.rotation.order = `YXZ`,
                    this.sprite.userData.agent = this,
                    this.group.add(this.sprite),
                    spriteMeshes.push(this.sprite);
                    this.blob = new e.Mesh(RGEO, new e.MeshBasicMaterial({ color: 0, transparent: !0, opacity: .26, depthWrite: !1 }));
                    this.blob.position.y = .015,
                    this.blob.renderOrder = 1,
                    this.group.add(this.blob);
                    this.bubbleMat = new e.MeshBasicMaterial({ transparent: !0, depthWrite: !1, fog: !1 });
                    this.bubble = new e.Mesh(BGEO, this.bubbleMat);
                    this.bubble.visible = !1,
                    this.bubble.renderOrder = 8,
                    this.group.add(this.bubble);
                    Object.assign(this, {
                        anim: `idle`,
                        facing: 1,
                        animT: a(0, 10),
                        frame: -1,
                        steps: o(600, 3800),
                        coffees: o(0, 3),
                        energy: a(.45, .95),
                        label: `Getting to work`,
                        queue: [],
                        cur: null,
                        bubbleT: 0,
                        bubbleDur: 0,
                        y0: 0,
                        navPts: null,
                        navI: 0,
                        presence: `in`,
                        busy: !1,
                        chatReq: null,
                        pending: null,
                        meetAt: null,
                        metDone: !1,
                        sched: null,
                        deskSpot: null,
                        homeAnim: `idle`
                    }, meta)
                }
                get x() { return this.group.position.x }
                get z() { return this.group.position.z }
                setXZ(x, z) { this.group.position.x = x, this.group.position.z = z }
                faceDir(x, z) {
                    let t = x * oe.x + z * oe.z;
                    Math.abs(t) > .01 && (this.facing = t > 0 ? 1 : -1)
                }
                addSteps(t) { this.steps += t * 1.9 }
                say(txt, dur = 2.6) {
                    this.isTextBubble = !1;
                    if (this.bubble.geometry !== BGEO) {
                        this.bubble.geometry.dispose();
                        this.bubble.geometry = BGEO;
                    }
                    this.bubbleMat.map = En(txt);
                    this.bubbleMat.depthTest = !1;
                    this.bubbleMat.depthWrite = !1;
                    this.bubbleMat.needsUpdate = !0;
                    this.bubble.renderOrder = 999;
                    this.bubble.visible = !0;
                    this.bubbleT = 0;
                    this.bubbleDur = dur;
                }
                sayText(txt, dur = 8.0) {
                    this.isTextBubble = !0;
                    let data = createSpeechBubbleData(this.name, txt);
                    if (this.bubble.geometry !== BGEO) {
                        this.bubble.geometry.dispose();
                    }
                    this.bubble.geometry = new e.PlaneGeometry(data.worldW, data.worldH);
                    this.bubbleMat.map = data.texture;
                    this.bubbleMat.depthTest = !1;
                    this.bubbleMat.depthWrite = !1;
                    this.bubbleMat.needsUpdate = !0;
                    this.bubble.renderOrder = 999;
                    this.bubbleWorldH = data.worldH;
                    this.bubble.visible = !0;
                    this.bubbleT = 0;
                    this.bubbleDur = dur;
                }
                begin(task) {
                    task.label && (this.label = task.label),
                    task.t === `move` || task.t === `nav` ? (this.anim = task.anim || `walk`, this.group.position.y = 0) : task.t === `wait` && (
                        this.anim = task.anim || `idle`,
                        this.group.position.y = task.y ?? this.y0,
                        task.faceX !== void 0 && this.faceDir(task.faceX - this.x, task.faceZ - this.z),
                        task.bubble && this.say(s(task.bubble), 1.8)
                    )
                }
                /* wipe the current plan (used by the director to retask someone) */
                interrupt() {
                    this.queue.length = 0,
                    this.cur = null,
                    this.navPts = null,
                    this.bubble.visible = !1
                }
                goTo(x, z, label, spd) {
                    this.queue.push({ t: `nav`, x, z, label, speed: spd })
                }
                /* teleport onto a seat / spot (chairs are too tight to walk onto) */
                snapTo(x, z, y, fx, fz) {
                    this.setXZ(x, z),
                    this.group.position.y = y,
                    fx !== void 0 && this.faceDir(fx - x, fz - z)
                }
                /* stand up from a seat beside it, ready to walk */
                standAt(x, z, fx, fz) {
                    this.setXZ(x, z),
                    this.group.position.y = 0,
                    this.anim = `walk`,
                    fx !== void 0 && this.faceDir(fx - x, fz - z)
                }
                runQueue(dt) {
                    if (!this.cur) {
                        if (this.queue.length || this.think0(),
                        this.cur = this.queue.shift(),
                        !this.cur) return;
                        this.begin(this.cur)
                    }
                    let t = this.cur;
                    if (t.t === `move`) {
                        let n2 = t.x - this.x
                          , r2 = t.z - this.z
                          , i2 = Math.hypot(n2, r2)
                          , o2 = (t.speed || .85) * dt;
                        i2 <= o2 ? (this.setXZ(t.x, t.z), this.addSteps(i2), this.cur = null) : (this.setXZ(this.x + n2 / i2 * o2, this.z + r2 / i2 * o2), this.addSteps(o2), this.faceDir(n2, r2))
                    } else if (t.t === `nav`) {
                        if (!this.navPts) {
                            this.navPts = navRoute(this.x, this.z, t.x, t.z),
                            this.navI = 0,
                            this.anim = t.anim || `walk`,
                            this.group.position.y = 0
                        }
                        let tp = this.navPts[this.navI];
                        if (!tp) { this.cur = null, this.navPts = null; return }
                        let n2 = tp[0] - this.x
                          , r2 = tp[1] - this.z
                          , i2 = Math.hypot(n2, r2)
                          , o2 = (t.speed || .9) * SPEED_MULT * dt;
                        if (i2 <= o2) {
                            this.setXZ(tp[0], tp[1]),
                            this.addSteps(i2),
                            this.navI++;
                            this.navI >= this.navPts.length && (this.cur = null, this.navPts = null)
                        } else
                            this.setXZ(this.x + n2 / i2 * o2, this.z + r2 / i2 * o2),
                            this.addSteps(o2),
                            this.faceDir(n2, r2)
                    } else
                        t.t === `wait` ? (t.dur -= dt,
                        t.bubbles && !this.bubble.visible && Math.random() < dt * .07 && this.say(s(t.bubbles)),
                        t.chat && !this.bubble.visible && Math.random() < dt * .42 && this.say(s(t.chat), 1.9),
                        t.dur <= 0 && (this.cur = null)) : t.t === `fn` && (this.cur = null, t.fn())
                }
                update(dt) {
                    this.custom ? this.custom(dt) : this.runQueue(dt),
                    this.animate(dt);
                    let t = this.bubble;
                    if (t.visible) {
                        this.bubbleT += dt;
                        let n = this.bubbleT
                          , r = n < .25 ? 1.1 * Math.sin(n / .25 * Math.PI / 2) : n > this.bubbleDur - .2 ? Math.max(.01, (this.bubbleDur - n) / .2) : 1;
                        t.scale.setScalar(r),
                        n > this.bubbleDur && (t.visible = !1)
                    }
                    this.blob.position.y = -this.group.position.y + .015
                }
                animate(dt) {
                    this.animT += dt;
                    let t = 0;
                    switch (this.anim) {
                        case `walk`: t = 2 + Math.floor(this.animT * 7) % 4; break;
                        case `sit`: t = 6; break;
                        case `sitsip`: t = 7; break;
                        case `sittype`: t = 8 + Math.floor(this.animT * 8) % 2; break;
                        case `standtype`: t = 10 + Math.floor(this.animT * 7) % 2; break;
                        case `standdrink`: t = 12 + Math.floor(this.animT * 1.4) % 2; break;
                        default: t = Math.floor(this.animT * 1.6) % 2
                    }
                    t !== this.frame && (this.frame = t, this.tex.offset.x = t / this.sheet.frames);
                    let baseHeadY = (this.anim === `sit` || this.anim === `sitsip` || this.anim === `sittype`) ? 0.95 : 1.25;
                    this.bubble.position.y = this.isTextBubble 
                        ? (baseHeadY + (this.bubbleWorldH || 0.6) / 2 + 0.05) 
                        : (baseHeadY + 0.36);
                }
                billboard() {
                    this.sprite.rotation.set(-.26, se, 0),
                    this.sprite.scale.x = this.facing,
                    this.bubble.rotation.set(-.26, se, 0)
                }
            };

            /* ---------- roles, names, flavour ---------- */
            var NAMES = [`Momo`, `Nova`, `Pixel`, `Byte`, `Juno`, `Ada`, `Chip`, `Wren`, `Luna`, `Otto`, `Vega`, `Kip`, `Suki`, `Dex`, `Mara`, `Tobi`, `Iris`, `Finn`, `Zara`, `Remy`, `Nix`, `Ola`, `Pim`, `Uma`]
              , ROLES = {
                ceo: `Founder & CEO`, frontend: `Frontend Developer`, backend: `Backend Developer`,
                fullstack: `Full-stack Developer`, designer: `UI/UX Designer`, qa: `QA Engineer`,
                devops: `DevOps Engineer`, analyst: `Data Analyst`, security: `Security Engineer`,
                intern: `Intern`, support: `IT Support`, pm: `Product Manager`, reception: `Receptionist`,
                sysadmin: `System Administrator`, presenter: `Solutions Architect`, mobile: `Mobile Developer`,
                techlead: `Tech Lead`, sre: `Site Reliability Engineer`, officemgr: `Office Manager`,
                visitor: `Neighborhood Regular`, courier: `Courier`, nightops: `Overnight SRE`,
                guard: `Night Guard`, nightsupport: `Overnight Support`
            }
              , ACT = {
                frontend: [`Tuning the pixel grid`, `Reviewing PR #4821`, `Arguing with CSS`, `Renaming variables for clarity`, `Waiting for CI to pass`],
                backend: [`Refactoring the legacy module`, `Debugging a race condition`, `Reading the docs properly`, `Writing unit tests (finally)`, `Deleting code with confidence`],
                fullstack: [`Everywhere at once`, `Fixing what frontend broke`, `Fixing what backend broke`, `Reading Stack Overflow`, `Shipping a hotfix`],
                designer: [`Pushing pixels left`, `Arguing about kerning`, `Redesigning the landing page`, `Looking for the perfect green`, `Exporting assets @2x`],
                qa: [`Trying to break staging again`, `Writing a very polite bug report`, `Cannot reproduce the bug`, `Testing edge cases`, `Filing a P1 (sorry)`],
                devops: [`Watching the dashboards`, `Blaming DNS`, `Kubernetes is up to something`, `Restarting the servers`, `Terraforming carefully`],
                analyst: [`Querying the warehouse`, `Making a chart about charts`, `Arguing with a spreadsheet`, `Hunting for NULLs`, `Finding the signal in noise`],
                security: [`Auditing the firewall rules`, `Reading suspicious logs`, `Resetting passwords (again)`, `Running a scan`, `Zero trust, full coffee`],
                intern: [`Learning Git properly`, `Fetching coffee for the team`, `Fixing a typo in prod`, `Taking notes diligently`, `Asking great questions`],
                support: [`Have you tried turning it off and on?`, `Untangling a cable mess`, `Setting up a new laptop`, `Answering the hotline`, `Locating the any key`],
                pm: [`Updating the roadmap`, `Scheduling a meeting about meetings`, `Writing user stories`, `Watering the office plants`, `Aligning the stakeholders`],
                ceo: [`Reviewing Q3 projections`, `On a call with investors`, `Approving team holidays`, `Practicing the keynote`, `Dreaming up v2`],
                reception: [`Greeting visitors warmly`, `Sorting the mail`, `Booking the meeting rooms`, `Keeping the lobby perfect`],
                sysadmin: [`Racking a new server`, `Tracing a mystery cable`, `Restarting the router`, `Labeling everything`, `Admiring the blinking lights`],
                presenter: [`Presenting the new architecture`, `Pointing at the roadmap`, `Explaining the metrics`, `Fielding tough questions`],
                mobile: [`Waiting for the build`, `Fixing layouts on 3 more devices`, `Chasing a memory leak`, `Sipping thoughtfully`],
                techlead: [`Reviewing design docs`, `Mentoring over coffee`, `Planning the next sprint`, `Deep in thought`],
                sre: [`Patrolling the office`, `Investigating a strange noise`, `On a wellness walk`, `Checking the snack supply`],
                officemgr: [`Delivering important news`, `Restocking the coffee beans`, `Checking the snack supply`, `Making the rounds`],
                visitor: [`Taking a stroll`, `Walking off the lunch`, `Enjoying the weather`, `People-watching`],
                courier: [`Dropping off packages`, `Double-checking the label`, `Off to the next stop`],
                nightops: [`Watching the dashboards`, `Chasing a flaky cron job`, `Reading deploy logs`, `Ticket triage at 3am`, `Keeping the servers company`, `Quiet hours: patching`],
                guard: [`Walking the perimeter`, `Checking the door locks`, `Inspecting the kitchen`, `Sweeping the dev floor`, `Logging the round`],
                nightsupport: [`Answering overnight tickets`, `Monitoring the hotline`, `Updating the on-call wiki`, `Have you tried restarting it?`, `Debugging with the lights low`]
            }
              , TRACKS = [
                `“lofi beats to deploy to” — Chiptune Sessions`,
                `“infinite sprint retrospective” — The Standups`,
                `“git blame: the musical” — Merge Conflicts`,
                `“404 sleep not found” — Nightbuild`,
                `“rubber duck duets” — Pair Programmers`,
                `“kernel panic at the disco” — Root Cause`,
                `“async await async” — Promise Pool`,
                `“the daily standup (remix)” — Scrum Theory`,
                `“elevator jazz for elevators” — Floor 12`
            ]
              , BUB = {
                frontend: [`💻`, `🔥`, `🐛`, `✓`, `🎧`], backend: [`💾`, `🔧`, `🐛`, `😅`, `☕`],
                fullstack: [`💻`, `🤯`, `✓`, `🎧`], designer: [`🎨`, `✨`, `📐`, `🎧`],
                qa: [`🐛`, `🔍`, `✓`, `😅`], devops: [`🚀`, `🔧`, `⚠`, `✓`],
                analyst: [`📊`, `🤔`, `📈`], security: [`🔒`, `🛡`, `🤔`],
                intern: [`📝`, `☕`, `🌱`], support: [`🔧`, `💡`, `📞`, `✓`],
                pm: [`📋`, `📅`, `💬`], ceo: [`📈`, `💼`, `☕`, `🤝`, `💡`],
                reception: [`💬`, `😊`, `📅`, `🌸`], sysadmin: [`🖥`, `⚡`, `🤔`],
                presenter: [`📊`, `🎤`, `💡`], mobile: [`📱`, `☕`, `😴`],
                techlead: [`🎧`, `💻`, `☕`], sre: [`🚶`, `🔍`, `☁`], officemgr: [`📦`, `💬`, `🍪`],
                visitor: [`🚶`, `🎧`, `☀`, `📱`], courier: [`📦`, `🚚`, `🙂`],
                nightops: [`🖥`, `🌙`, `☕`, `⚠`, `📊`], guard: [`🛡`, `🔦`, `📋`, `🚶`],
                nightsupport: [`📞`, `🎧`, `💻`, `☕`, `🌙`]
            };

            function moodFor(hour) {
                return hour < 7 || hour >= 20 ? `🦉 Night owl mode` : hour < 10 ? `☕ Powered by espresso` : hour < 12 ? `🧑‍💻 In the zone` : hour < 13.5 ? `🍜 Lunch on the mind` : hour < 16 ? `😅 Surviving meetings` : hour < 18 ? `🎵 Lo-fi and shipping` : `🌙 Wrapping up`
            }

            /* ---------- behaviors ---------- */
            var THINK = {
                desk(p) {
                    let typing = p.stand ? `standtype` : `sittype`;
                    p.queue.push({ t: `wait`, dur: a(8, 22), anim: typing, y: p.y0, label: s(ACT[p.role]), bubbles: BUB[p.role] }),
                    Math.random() < .32 && p.queue.push({ t: `wait`, dur: a(1.4, 2.6), anim: `sitsip`, y: p.y0, label: `Coffee break at the desk`, bubbles: [`☕`], coffee: !0 }),
                    Math.random() < .16 && p.queue.push({ t: `wait`, dur: a(2, 4), anim: p.stand ? `idle` : `sit`, y: p.y0, label: `Stretching after a long build`, bubbles: [`😮‍💨`, `🧘`] })
                },
                ceo(p) {
                    if (Math.random() < .4) {
                        p.queue.push({ t: `wait`, dur: a(6, 14), anim: `sittype`, y: p.y0, label: s(ACT.ceo), bubbles: BUB.ceo }),
                        p.queue.push({ t: `fn`, fn: () => p.standAt(CEO_STAND[0], CEO_STAND[1]) }),
                        p.goTo(CEO_PACE[0], CEO_PACE[1], `Pacing the corner office`, .7),
                        p.queue.push({ t: `wait`, dur: a(3, 7), anim: `idle`, label: `Looking at the skyline`, faceX: 30, faceZ: 14, bubbles: [`🌃`, `💭`] }),
                        p.goTo(p.deskSpot.ax, p.deskSpot.az, `Back to the desk`, .7),
                        p.queue.push({ t: `fn`, fn: () => p.snapTo(p.deskSpot.sx, p.deskSpot.sz, p.deskSpot.y, p.deskSpot.fx, p.deskSpot.fz) })
                    } else
                        p.queue.push({ t: `wait`, dur: a(10, 24), anim: `sittype`, y: p.y0, label: s(ACT.ceo), bubbles: BUB.ceo })
                },
                reception(p) {
                    p.queue.push({ t: `wait`, dur: a(6, 14), anim: `idle`, label: s(ACT.reception), bubbles: BUB.reception }),
                    Math.random() < .3 && p.queue.push({ t: `wait`, dur: a(1, 2), anim: `standdrink`, label: `Sipping earl grey`, bubbles: [`☕`], coffee: !0 })
                },
                meet(p) {
                    p.queue.push({ t: `wait`, dur: a(12, 26), anim: `sittype`, y: p.y0, label: s(ACT[p.role] || ACT.fullstack), bubbles: BUB[p.role] || BUB.fullstack }),
                    Math.random() < .25 && p.queue.push({ t: `wait`, dur: a(1.5, 3), anim: `sitsip`, y: p.y0, label: `Refueling during the meeting`, bubbles: [`☕`], coffee: !0 })
                },
                presenter(p) {
                    p.queue.push({ t: `wait`, dur: a(6, 14), anim: `standtype`, label: s(ACT.presenter), bubbles: BUB.presenter }),
                    Math.random() < .45 && (
                        p.goTo(PRESENTER_SPOT[0], PRESENTER_SPOT[1], `Sketching on the whiteboard`),
                        p.queue.push({ t: `wait`, dur: a(3, 6), anim: `standtype`, label: `Explaining the architecture`, bubbles: [`📊`, `✏`, `💡`] }),
                        p.goTo(p.home.x, p.home.z, `Back to the corner`))
                },
                sysadmin(p) {
                    p.queue.push({ t: `wait`, dur: a(8, 18), anim: `standtype`, label: s(ACT.sysadmin), bubbles: BUB.sysadmin }),
                    Math.random() < .35 && (
                        p.goTo(RACK_SPOT[0], RACK_SPOT[1], `Checking the racks`),
                        p.queue.push({ t: `wait`, dur: a(3, 6), anim: `standtype`, label: `Admiring the blinking lights`, bubbles: [`🖥`, `⚡`] }),
                        p.goTo(p.home.x, p.home.z, `Back to the terminal`))
                },
                nightops(p) {
                    p.queue.push({ t: `wait`, dur: a(8, 18), anim: `sittype`, y: p.y0, label: s(ACT.nightops), bubbles: BUB.nightops }),
                    Math.random() < .4 && p.queue.push({ t: `wait`, dur: a(1.4, 2.6), anim: `sitsip`, y: p.y0, label: `Night-shift coffee #3`, bubbles: [`☕`], coffee: !0 }),
                    Math.random() < .5 && (
                        p.queue.push({ t: `fn`, fn: () => p.standAt(p.deskSpot.ax, p.deskSpot.az) }),
                        p.goTo(RACK_SPOT[0], RACK_SPOT[1], `Rack check in the small hours`),
                        p.queue.push({ t: `fn`, fn: () => p.standAt(RACK_SPOT[0], RACK_SPOT[1], RACK_SPOT[2], RACK_SPOT[3]) }),
                        p.queue.push({ t: `wait`, dur: a(3.5, 7), anim: `standtype`, label: `Blinky lights all green`, bubbles: [`🖥`, `⚡`, `🌙`] }),
                        p.goTo(p.deskSpot.ax, p.deskSpot.az, `Back to the watch desk`),
                        p.queue.push({ t: `fn`, fn: () => p.snapTo(p.deskSpot.sx, p.deskSpot.sz, p.deskSpot.y, p.deskSpot.fx, p.deskSpot.fz) }))
                },
                nightdesk(p) {
                    p.queue.push({ t: `wait`, dur: a(9, 20), anim: `sittype`, y: p.y0, label: s(ACT.nightsupport), bubbles: BUB.nightsupport }),
                    Math.random() < .3 && p.queue.push({ t: `wait`, dur: a(1.4, 2.6), anim: `sitsip`, y: p.y0, label: `Herbal tea refuel`, bubbles: [`🍵`, `☕`], coffee: !0 }),
                    Math.random() < .2 && p.queue.push({ t: `wait`, dur: a(2, 4), anim: `sit`, y: p.y0, label: `Eyes off the screen for a sec`, bubbles: [`😮‍💨`, `🌙`] })
                },
                lounge(p) {
                    p.queue.push({ t: `wait`, dur: a(12, 24), anim: `sittype`, y: p.y0, label: s(ACT.techlead), bubbles: BUB.techlead }),
                    Math.random() < .3 && p.queue.push({ t: `wait`, dur: a(1.5, 3), anim: `sitsip`, y: p.y0, label: `Tea and deep thoughts`, bubbles: [`🍵`], coffee: !0 })
                },
                walker(p) {
                    let route = p.routes.shift();
                    p.routes.push(route);
                    for (let [x, z, wait, lbl] of route)
                        p.goTo(x, z, lbl || `Heading somewhere important`, a(.75, .95)),
                        wait && p.queue.push({ t: `wait`, dur: wait, anim: `idle`, label: s(ACT[p.role]), bubbles: BUB[p.role], faceX: x + a(-2, 2), faceZ: z + a(-2, 2) })
                },
                ped(p) {
                    let t2 = s(Math.random() < .45 ? PED_NODES.slice(0, 15) : PED_NODES);   /* near-office bias keeps the plaza alive */
                    p.goTo(t2[0] + a(-1, 1), t2[1] + a(-.5, .5), s(PED_ACT), a(.7, .95)),
                    Math.random() < .55 && p.queue.push({ t: `wait`, dur: a(1.5, 4), anim: `idle`, label: s(PED_ACT), bubbles: PED_BUB })
                },
                courier(p) { /* driven entirely by the director */ }
            };

            /* walk back to your own desk and settle in after an errand */
            function returnToDesk(p) {
                let ds = p.deskSpot;
                if (!ds) { p.busy = !1; return }
                p.group.position.y = 0;
                p.goTo(ds.ax, ds.az, `Back to work`);
                p.queue.push({ t: `fn`, fn: () => p.snapTo(ds.sx, ds.sz, ds.y, ds.fx, ds.fz) });
                p.queue.push({ t: `wait`, dur: .8, anim: ds.stand ? `standtype` : `sittype`, y: ds.y });
                p.queue.push({ t: `fn`, fn: () => { p.busy = !1 } })
            }

            /* a little errand: stand up, walk somewhere, do the thing, come back */
            function errand(p, spot, anim, dur, bubbles, coffee, label) {
                let ds = p.deskSpot;
                p.queue.push({ t: `fn`, fn: () => p.standAt(ds.ax, ds.az) });
                p.goTo(spot[0], spot[1], label);
                p.queue.push({ t: `fn`, fn: () => p.standAt(spot[0], spot[1], spot[2], spot[3]) });
                p.queue.push({ t: `wait`, dur, anim, label, bubbles, coffee });
                p.queue.push({ t: `fn`, fn: () => returnToDesk(p) })
            }

            /* two teammates meet somewhere and natter in emoji */
            function startChat(pa, pb, spot) {
                let dur = a(7, 11);
                pa.busy = pb.busy = !0;
                [[pa, spot.a, spot.b, pb], [pb, spot.b, spot.a, pa]].forEach(([p, sp, osp, other]) => {
                    p.interrupt();
                    p.group.position.y = 0;
                    p.goTo(sp[0], sp[1], `Chatting with ${other.name}`);
                    p.queue.push({ t: `fn`, fn: () => p.snapTo(sp[0], sp[1], sp[2] || 0, osp[0], osp[1]) });
                    p.queue.push({ t: `wait`, dur: dur + a(0, 1.5), anim: sp[2] ? `sit` : `idle`, y: sp[2] || 0, label: `Chatting with ${other.name}`, chat: CHAT_EMOJI });
                    p.queue.push({ t: `fn`, fn: () => returnToDesk(p) })
                })
            }

            /* wait-task coffee bookkeeping */
            var _begin = Person.prototype.begin;
            Person.prototype.begin = function (task) {
                _begin.call(this, task),
                task.coffee && this.coffees++
            };
            Person.prototype.think0 = function () {
                if (this.presence !== `in`) return;
                let cr = this.chatReq;
                if (cr) {
                    this.chatReq = null;
                    let b2 = cr.partner;
                    if (b2 && b2.presence === `in` && b2.chatReq && b2.chatReq.partner === this && !b2.busy && !this.busy) {
                        b2.chatReq = null;
                        startChat(this, b2, cr.spot);
                        return
                    }
                }
                if (this.pending) { let ev = this.pending; this.pending = null; ev(this); return }
                (THINK[this.behave] || THINK.desk)(this)
            };

            /* ---------- roster ---------- */
            function spawn(params, meta) {
                let p = new Person(params, meta);
                return p.setXZ(meta.home.x, meta.home.z),
                p.faceDir(meta.home.fx - meta.home.x, meta.home.fz - meta.home.z),
                p.group.position.y = meta.y0 || 0,
                p.anim = meta.anim,
                p
            }

            var ROSTER = [], STAFF = [], PEDS = [];
            var PED_NODES = NAVN.filter(nn => !nn[2]);

            /* schedule helpers — every staffer gets a daily arrive/lunch/leave rhythm */
            function addStaff(params, meta) {
                let p = spawn(params, meta);
                p.sched = { arrive: p.baseArrive, leave: p.baseLeave, lunch: a(12.05, 13.15), arrived: !1, departed: !1, lunched: !1 };
                p.formativeTemplate = {
                    name: p.name,
                    role: p.role,
                    roleTitle: meta.officeRoleTitle || p.roleTitle || ROLES[p.role] || p.role,
                    params: { ...params },
                    behave: p.behave,
                    night: Boolean(p.night),
                    baseArrive: p.baseArrive,
                    baseLeave: p.baseLeave,
                };
                p.formativeEnabled = true;
                p.isBench = Boolean(meta.isBench);
                p.isFacility = Boolean(meta.isFacility);
                p.isCeo = Boolean(meta.isCeo);
                if (meta.formativeEmployeeId) p.formativeEmployeeId = meta.formativeEmployeeId;
                if (meta.officeRoleTitle) p.officeRoleTitle = meta.officeRoleTitle;
                if (meta.officeSkills) p.officeSkills = [...meta.officeSkills];
                return ROSTER.push(p), STAFF.push(p), p
            }
            /* seated + standing desk workers — 12 (Configurable Employee Bench) */
            [
                [`frontend`, 0, {}, `Momo`, 7.5, 17.8], [`backend`, 1, {}, `Pixel`, 8.1, 18.3], [`designer`, 2, { glasses: !0 }, `Juno`, 8.6, 18.9],
                [`fullstack`, 3, {}, `Chip`, 7.8, 17.5], [`qa`, 4, {}, `Luna`, 8.9, 19.2], [`devops`, 5, {}, `Vega`, 9.2, 21.1],
                [`analyst`, 6, { glasses: !0 }, `Suki`, 7.4, 17.9], [`backend`, 7, {}, `Wren`, 8.4, 18.6]
            ].forEach(([role, i, over, nm, arr, lv]) => {
                let d = deskSpots[i], ch = d.chair
                  , ds = { ax: ch.x, az: ch.z - .7, sx: ch.x, sz: ch.z, y: .41, fx: ch.x, fz: ch.z + 3, stand: !1 };
                addStaff(personParams(over), {
                    name: nm, role, behave: `desk`, stand: !1, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: arr, baseLeave: lv, track: s(TRACKS),
                    isBench: true
                })
            });
            [
                [`security`, 8, { style: `short` }, `Ada`, 7.4, 21.7], [`intern`, 9, { style: `cap` }, `Kip`, 9.5, 18.1], [`support`, 10, { headset: !0 }, `Remy`, 7.9, 19.4]
            ].forEach(([role, i, over, nm, arr, lv]) => {
                let d = deskSpots[i]
                  , ds = { ax: d.x, az: d.z - .75, sx: d.x, sz: d.z - .75, y: 0, fx: d.x, fz: d.z + 3, stand: !0 };
                addStaff(personParams(over), {
                    name: nm, role, behave: `desk`, stand: !0, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `standtype`, homeAnim: `standtype`, deskSpot: ds,
                    baseArrive: arr, baseLeave: lv, track: s(TRACKS),
                    isBench: true
                })
            });
            {   /* Iris — now at the corner standing bar */
                let d = deskSpots[11]
                  , ds = { ax: d.x, az: d.z - .75, sx: d.x, sz: d.z - .75, y: 0, fx: d.x, fz: d.z + 3, stand: !0 };
                addStaff(personParams({ glasses: !0, style: `ponytail` }), {
                    name: `Iris`, role: `pm`, behave: `desk`, stand: !0, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `standtype`, homeAnim: `standtype`, deskSpot: ds,
                    baseArrive: 8.8, baseLeave: 18.4, track: s(TRACKS),
                    isBench: true
                })
            }
            /* CEO */
            {
                let ds = { ax: 11.5, az: 3.7, sx: 11.5, sz: 4.45, y: .41, fx: 11.5, fz: 8, stand: !1 };
                addStaff(personParams({ suit: `#2a3550`, tie: `#c8483e`, hair: `#c8c8cf`, style: `curly`, glasses: !0, pants: `#23262e`, shoe: `#2a2228` }), {
                    name: `Rex`, role: `ceo`, behave: `ceo`, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: 8.3, baseLeave: 18.5, track: `“the founder's playlist” — Rex`,
                    isCeo: true, formativeEmployeeId: `emp-ceo`, officeRoleTitle: `Chief Executive Agent`,
                    officeSkills: [`Task Planning`, `Project Context`, `Work Coordination`]
                })
            }
            /* receptionist — front of house hospitality */
            {
                let ds = { ax: -12.6, az: 4.35, sx: -12.6, sz: 4.35, y: 0, fx: -12.6, fz: 9, stand: !0 };
                addStaff(personParams({ headset: !0, style: `bun`, shirt: `#f2f0e6` }), {
                    name: `Zara`, role: `reception`, behave: `reception`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `idle`, homeAnim: `idle`, deskSpot: ds,
                    baseArrive: 6.9, baseLeave: 19.2, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-zara`, officeRoleTitle: `Receptionist`,
                    officeSkills: [`Guest Welcoming`, `Front Desk`, `Mail & Packages`, `Office Logistics`]
                })
            }
            /* meeting trio — their meeting-room seats ARE their desks */
            const MEET_ROLES = {
                Finn: { roleTitle: `Senior Backend Engineer`, skills: [`Distributed Systems`, `Database Optimization`, `High-Load Services`] },
                Otto: { roleTitle: `Lead Product Designer`, skills: [`Design Systems`, `Interface Ergonomics`, `Visual Polish`] },
                Mara: { roleTitle: `Data & Telemetry Specialist`, skills: [`Metrics Analysis`, `Event Pipelines`, `Growth Data`] },
            };
            [[10.2, `Finn`, `backend`, 7.9, 18.2], [11.8, `Otto`, `designer`, 8.5, 18.7], [13.4, `Mara`, `analyst`, 7.6, 17.7]].forEach(([x, nm, role, arr, lv]) => {
                let ds = { ax: x, az: -5.75, sx: x, sz: -5.05, y: .41, fx: x, fz: -1, stand: !1 };
                const info = MEET_ROLES[nm] || { roleTitle: ROLES[role] || role, skills: [] };
                addStaff(personParams(role === `designer` ? { glasses: !0, style: `long` } : {}), {
                    name: nm, role, behave: `meet`, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: arr, baseLeave: lv, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-${nm.toLowerCase()}`,
                    officeRoleTitle: info.roleTitle, officeSkills: info.skills
                })
            });
            /* presenter */
            {
                let ds = { ax: 15.6, az: -5.4, sx: 15.6, sz: -5.4, y: 0, fx: 17.5, fz: -4, stand: !0 };
                addStaff(personParams({ shirt: `#ffcf8a`, style: `short`, glasses: !0 }), {
                    name: `Tobi`, role: `presenter`, behave: `presenter`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `standtype`, homeAnim: `standtype`, deskSpot: ds,
                    baseArrive: 8.6, baseLeave: 18.4, track: `“conference keynote energy” — Tobi`,
                    isFacility: true, formativeEmployeeId: `ambient-tobi`, officeRoleTitle: `Solutions Architect`,
                    officeSkills: [`System Pitches`, `Architecture Demos`, `Keynotes`, `Tech Talks`]
                })
            }
            /* sysadmin — lives next to the rack terminal */
            {
                let ds = { ax: -16.5, az: -3.3, sx: -16.5, sz: -3.3, y: 0, fx: -18, fz: -3.3, stand: !0 };
                addStaff(personParams({ shirt: `#6a9fd8`, headset: !0, style: `short` }), {
                    name: `Dex`, role: `sysadmin`, behave: `sysadmin`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `standtype`, homeAnim: `standtype`, deskSpot: ds,
                    baseArrive: 7.8, baseLeave: 21.6, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-dex`, officeRoleTitle: `System Administrator`,
                    officeSkills: [`Linux Racks`, `Network Switches`, `Cooling & Power`, `Terminal Ops`, `Infrastructure`]
                })
            }
            /* Pim — "kitchen campus" desk at the round table */
            {
                let ds = { ax: -15.2, az: -8.2, sx: -14.4, sz: -8.2, y: .41, fx: -12.6, fz: -8.2, stand: !1 };
                addStaff(personParams({ style: `long` }), {
                    name: `Pim`, role: `mobile`, behave: `desk`, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: 9.4, baseLeave: 18.2, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-pim`, officeRoleTitle: `Mobile Developer`,
                    officeSkills: [`iOS & Android`, `React Native`, `Swift`, `Mobile APIs`]
                })
            }
            /* lounge — Uma on the sofa (now facing the room) */
            {
                let ds = { ax: 10.2, az: -10.55, sx: 10.2, sz: -9.72, y: .4, fx: 10.2, fz: -12, stand: !1 };
                addStaff(personParams({ style: `ponytail`, glasses: !0 }), {
                    name: `Uma`, role: `techlead`, behave: `lounge`, y0: .4,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: 8.8, baseLeave: 18.8, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-uma`, officeRoleTitle: `Staff Architect`,
                    officeSkills: [`System Architecture`, `Technical Strategy`, `RFCs`, `Mentorship`]
                })
            }
            /* walkers — now pathfinding, so they never clip the furniture */
            {
                let ds = { ax: -1, az: 6, sx: -1, sz: 6, y: 0, fx: 0, fz: 10, stand: !0 };
                let p1 = addStaff(personParams({ style: `cap`, headset: !1 }), {
                    name: `Nix`, role: `sre`, behave: `walker`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `walk`, homeAnim: `walk`, deskSpot: ds,
                    baseArrive: 7.2, baseLeave: 19.6, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-nix`, officeRoleTitle: `Site Reliability Engineer`,
                    officeSkills: [`Uptime & Monitoring`, `CI/CD Pipelines`, `Incident Response`],
                    routes: [[
                        [-1, 6, 2], [-4.5, 1, 0], [-6.5, -3.2, 2.5], [-6.5, -8.5, 0], [-9.4, -8.2, 4, `Coffee run`], [-6.5, -8.5, 0], [-6.5, -3.2, 2.5], [-4.5, 1, 0], [-1, 6, 3], [1.5, 6.5, 0], [-1, 6, 1]
                    ]]
                });
                p1.sched.arrive = 6.2, p1.sched.departed = !1, p1.baseArrive = 6.2
            }
            {
                let ds = { ax: 1, az: 5, sx: 1, sz: 5, y: 0, fx: 0, fz: 10, stand: !0 };
                addStaff(personParams({ shirt: `#c58ad8`, style: `bun` }), {
                    name: `Ola`, role: `officemgr`, behave: `walker`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `walk`, homeAnim: `walk`, deskSpot: ds,
                    baseArrive: 7.1, baseLeave: 18.7, track: s(TRACKS),
                    isFacility: true, formativeEmployeeId: `ambient-ola`, officeRoleTitle: `Office Operations Manager`,
                    officeSkills: [`Facilities Management`, `Team Culture`, `Snack Inventory`, `Events`],
                    routes: [[
                        [1, 5, 2], [4.2, 4, 0], [4.2, .5, 3, `Checking the meeting room`], [4.2, -6.5, 0], [2.5, -8.8, 2.5, `Visiting the devs`], [4.2, -6.5, 0], [4.2, 1.5, 0], [1, 5, 3], [-2.5, 6, 0], [1, 5, 1]
                    ]]
                })
            }
            /* sidewalk life — neighbours strolling the whole wide world now */
            const NEIGHBOUR_DEFS = {
                Pip: { roleTitle: `Neighborhood Regular`, skills: [`Coffee Connoisseur`, `Sidewalk Strolling`, `Local Gossip`] },
                Ash: { roleTitle: `Local Resident`, skills: [`Dog Walking`, `Morning Jogging`, `Community News`] },
                Mo: { roleTitle: `Tech Enthusiast`, skills: [`Tech Podcasts`, `Gadgets`, `Startup Watching`] },
                Nils: { roleTitle: `Local Freelancer`, skills: [`Remote Work`, `Cafe Hopping`, `Design Thinking`] },
                Vera: { roleTitle: `Nearby Coworker`, skills: [`Product Strategy`, `Lunch Walks`, `Sunny Strolls`] },
                Tom: { roleTitle: `Neighborhood Courier`, skills: [`Package Deliveries`, `Bicycle Nav`, `Speedy Drops`] },
            };
            [[`Pip`, {}, -20], [`Ash`, { style: `cap` }, 5], [`Mo`, { glasses: !0 }, 22], [`Nils`, { style: `short` }, -56], [`Vera`, { style: `ponytail` }, 52], [`Tom`, { style: `cap`, shirt: `#8fb8ff` }, 76]].forEach(([nm, over, x0]) => {
                const info = NEIGHBOUR_DEFS[nm] || { roleTitle: `Neighborhood Regular`, skills: [`Sidewalk Strolling`] };
                let p = spawn(personParams(over), {
                    name: nm, role: `visitor`, behave: `ped`, y0: 0,
                    home: { x: x0, z: 13.5, fx: x0 + 1, fz: 13.5 },
                    anim: `walk`, homeAnim: `walk`, deskSpot: null, track: s(TRACKS)
                });
                p.formativeEmployeeId = `neighbour-${nm.toLowerCase()}`;
                p.officeRoleTitle = info.roleTitle;
                p.officeSkills = [...info.skills];
                p.isPed = true;
                ROSTER.push(p), PEDS.push(p)
            });

            /* ================= PETS: cats on patrol & dogs with their humans ================= */
            ROLES.cat = `Neighbourhood Cat`;
            ROLES.dog = `Very Good Dog`;

            /* --- pixel pet sheets (drawn in the same 16×12 spirit as pomodoro park) --- */
            function drawDogFrame(ctx2, ox, fr, P) {
                let fur = P.fur, furD = p(fur, .75), ear = P.ear;
                if (fr === 2) {   /* polite sit */
                    v(ctx2, ox + 4, 5, 6, 4, fur), v(ctx2, ox + 3, 8, 4, 3, furD),
                        v(ctx2, ox + 9, 7, 1, 4, fur), v(ctx2, ox + 10, 7, 1, 4, furD),
                        v(ctx2, ox + 9, 1, 5, 4, fur), v(ctx2, ox + 13, 3, 2, 2, fur),
                        v(ctx2, ox + 14, 3, 1, 1, `#222`), v(ctx2, ox + 9, 1, 2, 3, ear),
                        v(ctx2, ox + 12, 2, 1, 1, `#222`), v(ctx2, ox + 9, 5, 2, 1, `#d84a4a`),
                        v(ctx2, ox + 1, 9, 2, 1, fur);
                    return
                }
                let s2 = fr === 0 ? 1 : fr === 1 ? -1 : 0;
                v(ctx2, ox + 3, 4, 9, 4, fur), v(ctx2, ox + 3, 7, 9, 1, furD),
                    v(ctx2, ox + 4 + s2, 8, 1, 3, furD), v(ctx2, ox + 6 - s2, 8, 1, 3, fur),
                    v(ctx2, ox + 9 - s2, 8, 1, 3, furD), v(ctx2, ox + 11 + s2, 8, 1, 3, fur),
                    v(ctx2, ox + 11, 1, 4, 4, fur), v(ctx2, ox + 14, 3, 2, 2, fur),
                    v(ctx2, ox + 15, 3, 1, 1, `#222`), v(ctx2, ox + 13, 2, 1, 1, `#222`),
                    v(ctx2, ox + 11, 1, 2, 3, ear), v(ctx2, ox + 11, 5, 1, 2, `#d84a4a`),
                    fr === 3 ? (v(ctx2, ox + 1, 1, 1, 2, fur), v(ctx2, ox + 2, 3, 1, 1, fur)) : v(ctx2, ox + 1, 3 + (fr === 1 ? 1 : 0), 2, 1, fur)
            }
            function dogSheet(P) {
                let cv2 = m(64, 12), ctx2 = cv2.getContext(`2d`);
                for (let fr = 0; fr < 4; fr++) drawDogFrame(ctx2, fr * 16, fr, P);
                return { canvas: b(cv2), frames: 4, fw: 16, fh: 12 }
            }
            function drawCatFrame(ctx2, ox, fr, P) {
                let fur = P.fur, furD = p(fur, .78), chest = P.chest, eye = P.eye
                    , coat = (x0, y0, w0) => {
                        if (P.coat === `tabby`)
                            for (let k = x0; k < x0 + w0; k += 2)
                                v(ctx2, ox + k, y0, 1, 2, P.acc);
                        P.coat === `calico` && (v(ctx2, ox + x0, y0, 2, 2, P.acc), v(ctx2, ox + x0 + 3, y0, 2, 1, P.acc2))
                    };
                if (fr <= 1) {   /* walk, two-step */
                    v(ctx2, ox + 3, 5, 8, 3, fur), coat(4, 5, 6), v(ctx2, ox + 4, 7, 6, 1, furD);
                    for (let [lx3, lg] of fr ? [[4, 1], [5, 0], [9, 1], [10, 0]] : [[3, 1], [6, 0], [8, 1], [11, 0]])
                        v(ctx2, ox + lx3, 8, 1, 3, lg ? furD : fur);
                    v(ctx2, ox + 10, 2, 4, 4, fur), v(ctx2, ox + 10, 1, 1, 1, fur), v(ctx2, ox + 13, 1, 1, 1, fur),
                        v(ctx2, ox + 11, 5, 2, 1, chest), v(ctx2, ox + 12, 3, 1, 1, eye),
                        v(ctx2, ox + 14, 4, 1, 1, `#e88a9a`), v(ctx2, ox + 2, 4, 1, 2, fur),
                        v(ctx2, ox + 1, 2, 1, 2, fur), v(ctx2, ox + 2, 1, 1, 1, fur)
                } else if (fr === 3) {   /* loaf / asleep */
                    v(ctx2, ox + 3, 7, 9, 4, fur), v(ctx2, ox + 2, 8, 1, 2, fur), v(ctx2, ox + 12, 8, 1, 2, fur),
                        coat(4, 7, 7),
                        v(ctx2, ox + 9, 5, 4, 3, fur), v(ctx2, ox + 9, 4, 1, 1, fur), v(ctx2, ox + 12, 4, 1, 1, fur),
                        v(ctx2, ox + 10, 6, 2, 1, furD), v(ctx2, ox + 3, 10, 8, 1, furD)
                } else {   /* 2 sit, 4 groom */
                    v(ctx2, ox + 4, 8, 3, 3, furD), v(ctx2, ox + 5, 5, 5, 5, fur), v(ctx2, ox + 8, 6, 2, 4, chest),
                        coat(5, 6, 3),
                        v(ctx2, ox + 8, 10, 1, 1, fur), v(ctx2, ox + 9, 10, 1, 1, furD), v(ctx2, ox + 7, 11, 4, 1, fur),
                        v(ctx2, ox + 2, 10, 4, 1, fur), v(ctx2, ox + 2, 9, 1, 1, fur),
                        fr === 2 ? (v(ctx2, ox + 7, 1, 5, 4, fur), v(ctx2, ox + 7, 0, 1, 1, fur), v(ctx2, ox + 11, 0, 1, 1, fur),
                            v(ctx2, ox + 9, 2, 1, 1, eye), v(ctx2, ox + 11, 2, 1, 1, eye), v(ctx2, ox + 10, 3, 1, 1, `#e88a9a`),
                            v(ctx2, ox + 9, 4, 3, 1, `#e88a9a`))
                            : (v(ctx2, ox + 8, 2, 5, 4, fur), v(ctx2, ox + 8, 1, 1, 1, fur), v(ctx2, ox + 12, 1, 1, 1, fur),
                                v(ctx2, ox + 10, 3, 2, 1, furD), v(ctx2, ox + 12, 5, 1, 1, `#e88a9a`),
                                v(ctx2, ox + 11, 5, 1, 3, fur))
                }
            }
            function catSheet(P) {
                let cv2 = m(80, 12), ctx2 = cv2.getContext(`2d`);
                for (let fr = 0; fr < 5; fr++) drawCatFrame(ctx2, fr * 16, fr, P);
                return { canvas: b(cv2), frames: 5, fw: 16, fh: 12 }
            }

            /* --- the Pet agent: walks the same roster as people, clickable like people --- */
            var Pet = class {
                constructor(opts) {
                    this.kind = opts.kind, this.name = opts.name, this.role = opts.kind;
                    this.owner = opts.owner || null, this.home = opts.home, this.spots = opts.spots || [];
                    this.sheet = opts.kind === `cat` ? catSheet(opts.params) : dogSheet(opts.params);
                    this.tex = h(this.sheet.canvas);
                    this.tex.repeat.set(1 / this.sheet.frames, 1);
                    this.mat = new e.MeshBasicMaterial({ map: this.tex, alphaTest: .5, side: e.DoubleSide });
                    personMats.push(this.mat);
                    let w2 = 16 * cn * (opts.kind === `cat` ? .85 : 1)
                        , h2 = 12 * cn * (opts.kind === `cat` ? .85 : 1)
                        , geo = new e.PlaneGeometry(w2, h2);
                    geo.translate(0, h2 / 2, 0);
                    this.group = new e.Group, T.add(this.group);
                    this.sprite = new e.Mesh(geo, this.mat);
                    this.sprite.rotation.order = `YXZ`, this.sprite.userData.agent = this, this.group.add(this.sprite),
                        spriteMeshes.push(this.sprite);
                    this.blob = new e.Mesh(RGEO, RBLOB);
                    this.blob.position.y = .015, this.blob.renderOrder = 1,
                        this.kind === `dog` ? this.blob.scale.set(1.3, 1, .7) : this.blob.scale.set(1, 1, .55),
                        this.group.add(this.blob);
                    this.bubbleMat = new e.MeshBasicMaterial({ transparent: !0, depthWrite: !1, fog: !1 });
                    this.bubble = new e.Mesh(BGEO, this.bubbleMat);
                    this.bubble.visible = !1, this.bubble.renderOrder = 8, this.group.add(this.bubble);
                    Object.assign(this, {
                        anim: opts.kind === `cat` ? `sit` : `idle`,
                        facing: 1, animT: a(0, 10), frame: 0,
                        steps: o(300, 2400), coffees: 0, energy: a(.7, .95),
                        label: opts.kind === `cat` ? `Judging passers-by` : `Being a very good dog`,
                        track: opts.kind === `cat` ? `“bookshop cat nap” — Park FM` : `“the squeaky toy song” — Good Dogs`,
                        wp: null, wait: a(1, 3), waitFor: 0, waitAnim: `sit`, spd: a(.55, .8),
                        sniffT: 0, sniff: { x: .6, z: .3 }, idleT: 0, bubbleT: 0, bubbleDur: 0
                    });
                    this.setXZ(opts.home[0], opts.home[1]),
                        this.group.position.y = opts.home[2] || 0,
                        ROSTER.push(this)
                }
                get x() { return this.group.position.x }
                get z() { return this.group.position.z }
                setXZ(x, z) { this.group.position.x = x, this.group.position.z = z }
                faceDir(dx, dz) {
                    let t2 = dx * oe.x + dz * oe.z;
                    Math.abs(t2) > .01 && (this.facing = t2 > 0 ? 1 : -1)
                }
                say(txt, dur = 2.6) {
                    this.isTextBubble = !1;
                    if (this.bubble.geometry !== BGEO) {
                        this.bubble.geometry.dispose();
                        this.bubble.geometry = BGEO;
                    }
                    this.bubbleMat.map = En(txt);
                    this.bubbleMat.depthTest = !1;
                    this.bubbleMat.depthWrite = !1;
                    this.bubbleMat.needsUpdate = !0;
                    this.bubble.renderOrder = 999;
                    this.bubble.visible = !0;
                    this.bubbleT = 0;
                    this.bubbleDur = dur;
                }
                sayText(txt, dur = 3.5) {
                    this.isTextBubble = !0;
                    let data = createSpeechBubbleData(this.name, txt);
                    if (this.bubble.geometry !== BGEO) {
                        this.bubble.geometry.dispose();
                    }
                    this.bubble.geometry = new e.PlaneGeometry(data.worldW, data.worldH);
                    this.bubbleMat.map = data.texture;
                    this.bubbleMat.depthTest = !1;
                    this.bubbleMat.depthWrite = !1;
                    this.bubbleMat.needsUpdate = !0;
                    this.bubble.renderOrder = 999;
                    this.bubbleWorldH = data.worldH;
                    this.bubble.visible = !0;
                    this.bubbleT = 0;
                    this.bubbleDur = dur;
                }
                bubbleTick(dt) {
                    let t2 = this.bubble;
                    if (!t2.visible) return;
                    this.bubbleT += dt;
                    let n2 = this.bubbleT
                        , r2 = n2 < .25 ? 1.1 * Math.sin(n2 / .25 * Math.PI / 2) : n2 > this.bubbleDur - .2 ? Math.max(.01, (this.bubbleDur - n2) / .2) : 1;
                    t2.scale.setScalar(r2),
                        n2 > this.bubbleDur && (t2.visible = !1)
                }
                update(dt) {
                    this.kind === `dog` ? this.updDog(dt) : this.updCat(dt),
                        this.bubbleTick(dt)
                }
                /* dogs trot beside their human, sniff when they stop, sit when patient */
                updDog(dt) {
                    let o = this.owner;
                    if (!o) return;
                    if (this.leash && (this.leash.visible = o.group.visible), !o.group.visible) { this.group.visible = !1; return }
                    this.group.visible = !0;
                    if (this.sniffT -= dt, this.sniffT < 0) {
                        this.sniffT = a(1.5, 4);
                        let ang = a(0, c), rr = a(.5, 1.1);
                        this.sniff = { x: Math.cos(ang) * rr, z: Math.sin(ang) * rr * .6 }
                    }
                    let walking = o.anim === `walk`
                        , tx = o.x + (walking ? -Math.sign(o.facing) * oe.x * .7 : this.sniff.x)
                        , tz = o.z + (walking ? -Math.sign(o.facing) * oe.z * .7 + .25 : this.sniff.z)
                        , dx = tx - this.x, dz = tz - this.z
                        , d = Math.hypot(dx, dz);
                    if (d > .1) {
                        let step = Math.min(d * 3, 2.6) * dt;
                        this.setXZ(this.x + dx / d * step, this.z + dz / d * step),
                            this.steps += step * 4.2,
                            this.faceDir(dx, dz),
                            this.anim = `trot`,
                            this.idleT = 0
                    } else
                        this.idleT += dt,
                            this.anim = this.idleT > 2.5 ? `sit` : `idle`;
                    this.label = walking ? `Trotting happily beside ${o.name}` : this.anim === `sit` ? `Sitting politely for ${o.name}` : `Sniffing every single blade of grass`,
                        !this.bubble.visible && Math.random() < dt * .04 && this.say(s([`🐕`, `🦴`, `💕`])),
                        this.animate(dt);
                    if (this.leash) {
                        let pa = this.leash.geometry.attributes.position.array;
                        pa[0] = o.x, pa[1] = .62, pa[2] = o.z,
                            pa[3] = this.x, pa[4] = .3, pa[5] = this.z,
                            this.leash.geometry.attributes.position.needsUpdate = !0
                    }
                }
                /* cats roam a handful of favourite spots and sleep at home at night */
                updCat(dt) {
                    if (this.wp && this.wp.length) {
                        let t2 = this.wp[0]
                            , dx = t2[0] - this.x, dz = t2[1] - this.z
                            , d = Math.hypot(dx, dz);
                        if (d < .07) {
                            this.setXZ(t2[0], t2[1]),
                                this.group.position.y = t2[2] || 0,
                                this.wp.shift(),
                                this.wp.length || (this.wait = this.waitFor)
                        } else {
                            let step = Math.min(d, this.spd) * dt;
                            this.setXZ(this.x + dx / d * step, this.z + dz / d * step),
                                this.group.position.y += ((t2[2] || 0) - this.group.position.y) * Math.min(1, step / d),
                                this.faceDir(dx, dz),
                                this.anim = `walk`,
                                this.steps += step * 4.2
                        }
                    } else if (this.wait > 0) {
                        this.wait -= dt,
                            this.anim = this.waitAnim,
                            this.wait <= 0 && this.catNext()
                    } else this.catNext();
                    this.animate(dt);
                    if (!this.bubble.visible && Math.random() < dt * .02)
                        this.say(this.anim === `sleep` ? `💤` : s([`🐾`, `😼`, `💕`]))
                }
                catNext() {
                    let night = Z.night > .62;
                    if (night && Math.hypot(this.x - this.home[0], this.z - this.home[1]) > .4) {
                        this.wp = [[this.home[0], this.home[1], this.home[2] || 0]],
                            this.waitFor = a(14, 30),
                            this.waitAnim = `sleep`,
                            this.label = `Trotting back to its favourite spot`;
                        return
                    }
                    if (night) {
                        this.wait = a(8, 20),
                            this.waitAnim = `sleep`,
                            this.label = s([`Curled up, purring`, `Dreaming of butterflies`, `One paw over the nose`]);
                        return
                    }
                    if (Math.random() < .55 && this.spots.length) {
                        let spot = s(this.spots);
                        this.wp = spot.map(p2 => [p2[0], p2[1], p2[2]]),
                            this.waitFor = a(4, 12),
                            this.waitAnim = s([`sit`, `groom`, `sit`]),
                            this.label = s([`Prowling around`, `Investigating a leaf`, `Patrolling the territory`, `Stalking a petal`])
                    } else
                        this.wait = a(3, 9),
                            this.waitAnim = s([`sit`, `groom`]),
                            this.label = s([`Grooming a paw`, `Sitting like a loaf of bread`, `Judging passers-by`, `Hunting a butterfly`])
                }
                animate(dt) {
                    this.animT += dt;
                    let fr;
                    if (this.kind === `dog`)
                        fr = this.anim === `trot` ? Math.floor(this.animT * 8) % 2 : this.anim === `sit` ? 2 : 3;
                    else
                        fr = this.anim === `walk` ? Math.floor(this.animT * 7) % 2
                            : this.anim === `sleep` ? 3
                                : this.anim === `groom` && Math.floor(this.animT * 1.6) % 2 ? 4 : 2;
                    fr !== this.frame && (this.frame = fr, this.tex.offset.x = fr / this.sheet.frames);
                    let baseHeadY = this.kind === `cat` ? (this.anim === `sleep` ? .38 : .52) : (this.anim === `sit` ? .45 : .58);
                    this.bubble.position.y = this.isTextBubble
                        ? (baseHeadY + (this.bubbleWorldH || .45) / 2 + .12)
                        : (baseHeadY + .36);
                }
                billboard() {
                    this.sprite.rotation.set(-.26, se, 0),
                    this.sprite.scale.x = this.facing,
                    this.bubble.rotation.set(-.26, se, 0)
                }
            };

            /* dog-walker behaviour: an amble between random world nodes, with pauses for sniffing */
            THINK.dogwalker = function (p) {
                let t2 = s(Math.random() < .4 ? PED_NODES.slice(0, 15) : PED_NODES), dn = p.dog ? p.dog.name : `the dog`;
                p.goTo(t2[0] + a(-1, 1), t2[1] + a(-.5, .5), `Walking ${dn} around the block`, a(.8, 1.05));
                p.queue.push({
                    t: `wait`, dur: a(2, 5), anim: `idle`,
                    label: s([`Letting ${dn} sniff the flowers`, `Throwing a stick for ${dn}`, `Chatting with a fellow dog owner`]),
                    bubbles: [`🐕`, `🌸`, `💬`]
                })
            };

            /* --- two dog walkers + their very good dogs --- */
            for (let [nm, over, dogDef, hx, hz] of [
                [`Eli`, { style: `short`, shirt: `#7cc4a4` }, { name: `Biscuit`, fur: `#c8894a`, ear: `#7a4f2a` }, -45.8, 12],
                [`Nadia`, { style: `ponytail`, shirt: `#e88aa8` }, { name: `Waffles`, fur: `#f2e6d0`, ear: `#c8a070` }, 45.8, 12]
            ]) {
                let p = spawn(personParams(over), {
                    name: nm, role: `visitor`, behave: `dogwalker`, y0: 0,
                    home: { x: hx, z: hz, fx: hx + 1, fz: hz },
                    anim: `walk`, homeAnim: `walk`, deskSpot: null, track: s(TRACKS)
                });
                ROSTER.push(p), PEDS.push(p);
                let dog = new Pet({ kind: `dog`, name: dogDef.name, params: dogDef, owner: p, home: [hx + .8, hz + .4, 0] });
                p.dog = dog;
                dog.setXZ(p.x + .7, p.z + .4);
                let leash = new e.Line(new e.BufferGeometry().setFromPoints([new e.Vector3, new e.Vector3]), new e.LineBasicMaterial({ color: `#3a2a30` }));
                leash.frustumCulled = !1,
                    T.add(leash),
                    dog.leash = leash
            }
            /* --- three neighbourhood cats with their favourite haunts --- */
            new Pet({
                kind: `cat`, name: `Mochi`,
                params: { fur: `#e8c9a0`, chest: `#f6ecd8`, eye: `#4a8a5a`, coat: `tabby`, acc: `#c8a06a` },
                home: [-13, -59.5, 0],
                spots: [
                    [[-13, -59.5, 0]], [[-7, -53.5, 0]],
                    [[4, -50.6, 0], [4, -53.2, .26], [4, -56.2, .26]],   /* out onto the pier */
                    [[9.5, -53, 0]], [[-2, -66, 0]], [[-11.9, -61.3, .46]]  /* naps on the west bench */
                ]
            });
            new Pet({
                kind: `cat`, name: `Pepper`,
                params: { fur: `#2f2b33`, chest: `#4a4550`, eye: `#e8b04c` },
                home: [-55, -64, 0],
                spots: [
                    [[-52.5, -49, 0]], [[-58, -54, 0]], [[-63, -60, 0]], [[-55, -64, 0]], [[-49.5, -58, 0]]
                ]
            });
            new Pet({
                kind: `cat`, name: `Mimi`,
                params: { fur: `#f2e6d0`, chest: `#fffaf0`, eye: `#5a8ac8`, coat: `calico`, acc: `#e88a4a`, acc2: `#4a4550` },
                home: [-14.9, 12.7, 0],
                spots: [
                    [[-8.2, 14.7, .46]], [[5.2, 14.7, .46]],   /* the plaza benches */
                    [[-14.9, 12.7, 0]], [[12, 13.6, 0]], [[2.5, 11.9, 0]]
                ]
            });
            /* the courier — appears when a delivery event fires */
            var COURIER = spawn(personParams({ cap: `#d95d5d`, style: `cap`, shirt: `#f2b84b` }), {
                name: `Bolt`, role: `courier`, behave: `courier`, y0: 0,
                home: { x: 34, z: 13.2, fx: 0, fz: 12 },
                anim: `walk`, homeAnim: `walk`, deskSpot: null, track: s(TRACKS)
            });
            COURIER.group.visible = !1, COURIER.presence = `out`,
            ROSTER.push(COURIER);

            /* ---------- night crew — the floor never sleeps ---------- */
            {   /* Nia — overnight SRE, watches the dashboards from the kitchen table */
                let ds = { ax: -13.5, az: -9.95, sx: -13.5, sz: -9.15, y: .41, fx: -13.5, fz: -4, stand: !1 };
                addStaff(personParams({ shirt: `#7ec4a8`, headset: !0, style: `bun` }), {
                    name: `Nia`, role: `nightops`, behave: `nightops`, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: 21.6, baseLeave: 6.4, night: !0, track: `“404 sleep not found” — Nightbuild`
                })
            }
            {   /* Sol — night guard on slow perimeter laps */
                let ds = { ax: -15.6, az: 6.2, sx: -15.6, sz: 6.2, y: 0, fx: -13, fz: 10.5, stand: !0 };
                addStaff(personParams({ shirt: `#4a5568`, pants: `#23262e`, cap: `#2a3550`, style: `cap` }), {
                    name: `Sol`, role: `guard`, behave: `walker`, y0: 0,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `walk`, homeAnim: `walk`, deskSpot: ds,
                    baseArrive: 21.3, baseLeave: 6.7, night: !0, track: s(TRACKS),
                    routes: [[
                        [-15.6, 6.2, 0], [-12.4, 6, 1.6, `Checking reception`], [-9.2, 1.9, 0], [-6.5, -3.2, 0], [-9.4, -8.2, 2.2, `Inspecting the kitchen`], [-6.5, -8.5, 0], [-4.5, 1, 0], [1, 5, 0], [4.2, .5, 2, `Sweeping the dev floor`], [4.2, -6.5, 0], [2.5, -8.8, 1.6, `Checking the lounge`], [4.2, -6.5, 0], [1, 5, 0], [-2.5, 6, 0], [-9.5, 5.6, 0], [-15.6, 6.2, 2.5, `Back on lobby watch`]
                    ]]
                })
            }
            {   /* Kit — overnight support, headset on in the lobby armchair */
                let ds = { ax: -12.5, az: 8.3, sx: -13.4, sz: 8.9, y: .41, fx: -15.4, fz: 9.1, stand: !1 };
                addStaff(personParams({ headset: !0, style: `cap`, shirt: `#c58ad8` }), {
                    name: `Kit`, role: `nightsupport`, behave: `nightdesk`, y0: .41,
                    home: { x: ds.sx, z: ds.sz, fx: ds.fx, fz: ds.fz },
                    anim: `sittype`, homeAnim: `sittype`, deskSpot: ds,
                    baseArrive: 22.1, baseLeave: 5.9, night: !0, track: `“elevator jazz for elevators” — Floor 12`
                })
            }

            /* ================= DIRECTOR (scripted office life) ================= */

            var DIR = { day: 0, evT: a(6, 14), dlvT: a(50, 110), lastToast: -99999, meetings: [] };

            function toastEv(msg) {
                let now = performance.now();
                if (now - DIR.lastToast < 9000) return;
                DIR.lastToast = now, Ui(msg)
            }

            function rollDay() {
                DIR.day = S.day;
                for (let p of STAFF) {
                    if (!p.formativeEnabled) continue;
                    let sc = p.sched;
                    sc.arrive = p.baseArrive + a(-.15, .55);
                    sc.leave = p.baseLeave + a(-.45, .5);
                    sc.lunch = a(12.05, 13.15);
                    sc.arrived = sc.departed = sc.lunched = !1;
                    p.meetAt = null, p.metDone = !1
                }
                /* schedule one to three sprint meetings */
                DIR.meetings = [];
                let slots = [10.3, 14.4, 16.2]
                  , nM = 1 + (Math.random() < .55 ? 1 : 0) + (Math.random() < .2 ? 1 : 0);
                for (let m2 = 0; m2 < nM; m2++) {
                    let sl = slots.splice(Math.floor(Math.random() * slots.length), 1)[0];
                    let pool = STAFF.filter(p => p.formativeEnabled && p.behave === `desk` && p.baseArrive < sl && p.baseLeave > sl + 1)
                      , parts = []
                      , want = o(3, 4);
                    while (parts.length < want && pool.length) parts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
                    DIR.meetings.push({ h: sl, parts, dur: a(26, 40), fired: !1, tobi: !1 })
                }
                for (let m2 of DIR.meetings) for (let p of m2.parts) p.meetAt = m2.h
            }

            function placeAtDesk(p) {
                let ds = p.deskSpot;
                ds ? p.snapTo(ds.sx, ds.sz, ds.y, ds.fx, ds.fz) : 0;
                p.anim = p.homeAnim
            }

            function beginArrival(p) {
                p.presence = `transit`;
                p.interrupt();
                let sp = s(SPAWNS);
                p.group.visible = !0;
                p.setXZ(sp[0], sp[1]);
                p.group.position.y = 0;
                p.anim = `walk`;
                p.label = `Heading into the office`;
                p.say(`👋`, 2);
                p.goTo(DOOR_OUT[0], DOOR_OUT[1], `Heading into the office`);
                p.goTo(DOOR_IN[0], DOOR_IN[1]);
                p.queue.push({ t: `fn`, fn: () => {
                    let z2 = STAFF.find(q => q.formativeEnabled && q.role === `reception` && q.presence === `in` && !q.busy);
                    z2 && Math.random() < .8 && (z2.say(s([`👋`, `☕`, `😊`]), 2), p.say(`👋`, 1.6));
                    p.night ? toastEv(`${p.name} started the night shift.`) : toastEv(`${p.name} arrived at Formative.`)
                } });
                p.goTo(p.deskSpot.ax, p.deskSpot.az, `Settling in at the desk`);
                p.queue.push({ t: `fn`, fn: () => p.snapTo(p.deskSpot.sx, p.deskSpot.sz, p.deskSpot.y, p.deskSpot.fx, p.deskSpot.fz) });
                p.queue.push({ t: `wait`, dur: a(4, 9), anim: p.deskSpot.stand ? `standtype` : `sittype`, y: p.deskSpot.y, label: `Checking overnight messages`, bubbles: [`🖥`, `☕`, `📧`] });
                p.queue.push({ t: `fn`, fn: () => { p.presence = `in` } })
            }

            function beginLeave(p) {
                p.presence = `transit`;
                p.interrupt();
                p.label = `Heading home`;
                p.say(`👋`, 2.2);
                let ds = p.deskSpot;
                p.group.position.y = 0;
                ds && Math.hypot(p.x - ds.sx, p.z - ds.sz) < .6 && p.queue.push({ t: `fn`, fn: () => p.standAt(ds.ax, ds.az) });
                p.goTo(DOOR_IN[0], DOOR_IN[1], `Heading home for the day`);
                p.goTo(DOOR_OUT[0], DOOR_OUT[1]);
                let sp = s(SPAWNS);
                p.goTo(sp[0], sp[1], p.night ? `Off to sleep at last` : `Off into the evening`);
                p.queue.push({ t: `fn`, fn: () => { p.group.visible = !1, p.presence = `out`, p.setXZ(p.home.x, p.home.z) } });
                p.night ? toastEv(`${p.name} ended the night shift.`) : toastEv(`${p.name} left for the day.`)
            }

            function beginLunch(p) {
                p.interrupt();
                let ds = p.deskSpot;
                p.group.position.y = 0;
                Math.hypot(p.x - ds.sx, p.z - ds.sz) < .6 && p.queue.push({ t: `fn`, fn: () => p.standAt(ds.ax, ds.az) });
                let seat = pickFree(KSEATS);
                if (seat) {
                    p.label = `Lunch break`;
                    p.goTo(seat[3], seat[4], `Lunch break`);
                    p.queue.push({ t: `fn`, fn: () => p.snapTo(seat[0], seat[1], seat[2], seat[5], seat[6]) });
                    p.queue.push({ t: `wait`, dur: a(10, 18), anim: `sitsip`, y: seat[2], label: `Lunch at the kitchen table`, bubbles: [`🍜`, `😋`, `☕`], coffee: !0 });
                    p.queue.push({ t: `fn`, fn: () => { p.standAt(seat[3], seat[4]); returnToDesk(p) } })
                } else
                    errand(p, COFFEE_SPOT, `standdrink`, a(4, 7), [`☕`, `🍜`, `😌`], !0, `Lunchtime coffee`)
            }

            function beginMeeting(p, dur) {
                p.interrupt();
                let ds = p.deskSpot;
                Math.hypot(p.x - ds.sx, p.z - ds.sz) < .6 ? p.queue.push({ t: `fn`, fn: () => p.standAt(ds.ax, ds.az) }) : p.group.position.y = 0;
                let seat = pickFree(MEET_SEATS);
                if (!seat) { returnToDesk(p); return }
                p.busy = !0;
                p.goTo(seat[3], seat[4], `Heading into the sprint meeting`);
                p.queue.push({ t: `fn`, fn: () => p.snapTo(seat[0], seat[1], seat[2], seat[0], -1) });
                p.queue.push({ t: `wait`, dur: dur + a(0, 5), anim: `sittype`, y: seat[2], label: `In the sprint meeting`, bubbles: MEET_BUB });
                p.queue.push({ t: `fn`, fn: () => { p.standAt(seat[3], seat[4]); returnToDesk(p) } })
            }

            function ceoCall() {
                let ceo = STAFF.find(p => p.formativeEnabled && p.role === `ceo` && p.presence === `in` && !p.busy);
                if (!ceo) return !1;
                let pool = STAFF.filter(p => p.formativeEnabled && p.behave === `desk` && p.presence === `in` && !p.busy);
                if (!pool.length) return !1;
                let emp = s(pool);
                emp.busy = ceo.busy = !0;
                emp.interrupt();
                let ds = emp.deskSpot;
                Math.hypot(emp.x - ds.sx, emp.z - ds.sz) < .6 && emp.queue.push({ t: `fn`, fn: () => emp.standAt(ds.ax, ds.az) });
                emp.label = `1:1 with ${ceo.name}`;
                emp.goTo(7.5, 3.8, `Summoned to the corner office`);
                emp.goTo(CEO_GUESTS[0][3], CEO_GUESTS[0][4]);
                emp.queue.push({ t: `fn`, fn: () => emp.snapTo(CEO_GUESTS[0][0], CEO_GUESTS[0][1], CEO_GUESTS[0][2], 11.5, 5) });
                emp.queue.push({ t: `wait`, dur: a(9, 14), anim: `sit`, y: CEO_GUESTS[0][2], label: `1:1 with Rex`, chat: CHAT_EMOJI });
                emp.queue.push({ t: `fn`, fn: () => { emp.standAt(CEO_GUESTS[0][3], CEO_GUESTS[0][4]); returnToDesk(emp) } });
                ceo.interrupt();
                ceo.queue.push({ t: `fn`, fn: () => ceo.standAt(CEO_STAND[0], CEO_STAND[1]) });
                ceo.goTo(11.7, 7.3, `1:1 with ${emp.name}`, .75);
                ceo.queue.push({ t: `wait`, dur: a(9, 14), anim: `idle`, label: `1:1 with ${emp.name}`, chat: CHAT_EMOJI });
                ceo.queue.push({ t: `fn`, fn: () => { ceo.goTo(ceo.deskSpot.ax, ceo.deskSpot.az); ceo.queue.push({ t: `fn`, fn: () => { ceo.snapTo(ceo.deskSpot.sx, ceo.deskSpot.sz, ceo.deskSpot.y, ceo.deskSpot.fx, ceo.deskSpot.fz); ceo.busy = !1 } }) } });
                toastEv(`Scene event: ${ceo.name} is meeting with ${emp.name}.`);
                return !0
            }

            function incident() {
                let dex = STAFF.find(p => p.formativeEnabled && p.role === `sysadmin` && p.presence === `in` && !p.busy)
                    || STAFF.find(p => p.formativeEnabled && p.role === `nightops` && p.presence === `in` && !p.busy);
                if (!dex) return !1;
                dex.busy = !0;
                dex.interrupt();
                dex.label = `Prod incident!`;
                dex.say(`😱`, 2);
                dex.goTo(RACK_SPOT[0], RACK_SPOT[1], `Fighting the prod fire`, 1.25);
                dex.queue.push({ t: `fn`, fn: () => dex.standAt(RACK_SPOT[0], RACK_SPOT[1], RACK_SPOT[2], RACK_SPOT[3]) });
                dex.queue.push({ t: `wait`, dur: a(7, 12), anim: `standtype`, label: `Fighting the prod fire`, bubbles: [`⚠`, `🔧`, `🖥`, `😅`] });
                dex.queue.push({ t: `fn`, fn: () => {
                    toastEv(`Scene event: the team has returned to their desks.`);
                    returnToDesk(dex);
                    dex.queue.push({ t: `fn`, fn: () => { dex.busy = !1 } })
                } });
                toastEv(`Scene event: ${dex.name} is checking the server room.`);
                return !0
            }

            function delivery() {
                if (COURIER.presence !== `out`) return;
                COURIER.presence = `transit`;
                COURIER.group.visible = !0;
                COURIER.interrupt();
                let sp = s(SPAWNS);
                COURIER.setXZ(sp[0], sp[1]);
                COURIER.group.position.y = 0;
                COURIER.anim = `walk`;
                COURIER.label = `Delivery for Structra`;
                COURIER.goTo(DOOR_OUT[0], DOOR_OUT[1], `Delivery for Structra`, .95);
                COURIER.queue.push({ t: `wait`, dur: 2.6, anim: `idle`, label: `Dropping off packages`, bubbles: [`📦`, `🚚`] });
                COURIER.queue.push({ t: `fn`, fn: () => {
                    let z2 = STAFF.find(q => q.formativeEnabled && q.role === `reception` && q.presence === `in` && !q.busy);
                    z2 && z2.say(s([`👋`, `📦`, `😊`]), 2);
                    toastEv(`Scene event: a courier dropped off a package.`)
                } });
                COURIER.goTo(sp[0], sp[1], `Back to the van`);
                COURIER.queue.push({ t: `fn`, fn: () => { COURIER.group.visible = !1, COURIER.presence = `out` } })
            }

            function ambientEvent() {
                let eligible = STAFF.filter(p => p.formativeEnabled && p.presence === `in` && !p.busy && !p.pending && !p.chatReq && p.deskSpot && p.queue.length === 0 && p.behave !== `reception`);
                if (!eligible.length) return;
                let roll = Math.random();
                if (roll < .3) {
                    if (eligible.length >= 2) {
                        let spot = s(CHAT_SPOTS)
                          , p1 = s(eligible)
                          , p2 = s(eligible.filter(q => q !== p1));
                        p2 && (p1.chatReq = { partner: p2, spot }, p2.chatReq = { partner: p1, spot })
                    }
                } else if (roll < .52) {
                    let p = s(eligible);
                    p.pending = q => errand(q, COFFEE_SPOT, `standdrink`, a(3.5, 6), [`☕`, `😋`, `😌`], !0, `Coffee machine run`)
                } else if (roll < .68) {
                    let p = s(eligible);
                    p.pending = q => errand(q, COOLER_SPOT, `standdrink`, a(2.5, 4.5), [`💧`, `☕`, `😌`], !1, `Water cooler break`)
                } else if (roll < .8) {
                    let p = s(eligible);
                    p.pending = q => errand(q, WINDOW_SPOT, `idle`, a(3.5, 6), [`😮‍💨`, `🌆`, `🧘`], !1, `Stretch by the window`)
                } else if (roll < .88) {
                    let p = s(eligible);
                    p.pending = q => errand(q, PRINTER_SPOT, `idle`, a(2.5, 4), [`⏳`, `📄`], !1, `Waiting for the printer`)
                } else if (roll < .94) {
                    let p = s(eligible)
                      , b2 = s(BIN_SPOTS);
                    p.pending = q => errand(q, [b2[0], b2[1], b2[2], b2[3]], `idle`, a(1.5, 2.5), [`🗑`], !1, `Tossing the recycling`)
                } else {
                    let ola = STAFF.find(p => p.formativeEnabled && p.role === `officemgr` && p.presence === `in` && !p.busy && !p.pending);
                    if (ola) {
                        let pl = s(PLANT_SPOTS);
                        ola.pending = q => errand(q, [pl[0], pl[1], pl[2], pl[3]], `idle`, a(2, 3.5), [`🌿`, `💧`], !1, `Watering the plants`)
                    }
                }
            }

            /* hard re-place everyone after a time scrub (slider / live clock) */
            function presenceSnap() {
                let h = S.hour;
                for (let p of STAFF) {
                    if (!p.formativeEnabled) {
                        p.group.visible = !1;
                        p.presence = `out`;
                        continue;
                    }
                    let sc = p.sched;
                    p.interrupt();
                    p.busy = !1, p.chatReq = null, p.pending = null;
                    let inn = p.night ? (h >= sc.arrive || h < sc.leave) : (h >= sc.arrive && h < sc.leave);
                    sc.arrived = p.night ? (h >= sc.arrive || h < sc.leave) : h >= sc.arrive;
                    sc.departed = p.night ? (h >= sc.leave && h < 12) : h >= sc.leave;
                    sc.lunched = !(h >= sc.lunch && h < sc.lunch + .8) && h >= sc.lunch;
                    p.metDone = p.meetAt != null && h >= p.meetAt - .05;
                    if (inn) {
                        p.presence = `in`, p.group.visible = !0, placeAtDesk(p)
                    } else {
                        p.presence = `out`, p.group.visible = !1;
                        p.setXZ(p.home.x, p.home.z), p.group.position.y = p.y0 || 0, p.anim = p.homeAnim
                    }
                }
                let streetOn = h >= 6.4 && h < 21.9;
                for (let pd of PEDS) {
                    pd.interrupt();
                    pd.group.visible = streetOn, pd.presence = streetOn ? `in` : `out`;
                    streetOn && (() => {
                        let nn3 = s(PED_NODES);
                        pd.setXZ(nn3[0] + a(-1, 1), nn3[1] + a(-1, 1)), pd.anim = `walk`, pd.group.position.y = 0
                    })()
                }
                for (const p of STAFF) {
                    if (!p.formativeEnabled || !p.agentStatus) continue;
                    p.presence = `in`;
                    p.group.visible = true;
                    p.busy = true;
                    placeAtDesk(p);
                }
                COURIER.interrupt();
                COURIER.group.visible = !1, COURIER.presence = `out`;
                DIR.meetings.forEach(m2 => m2.fired = m2.fired || h >= m2.h)
            }

            function directorUpdate(dt) {
                S.day !== DIR.day && rollDay();
                let h = S.hour;
                for (let p of STAFF) {
                    if (!p.formativeEnabled || p.agentStatus) continue;
                    let sc = p.sched;
                    if (p.night) {
                        if (!sc.arrived && h >= sc.arrive && h < 23.95 && p.presence === `out`) { sc.arrived = !0; beginArrival(p) }
                        else if (!sc.departed && h >= sc.leave && h < 12 && p.presence === `in`) { sc.departed = !0; beginLeave(p) }
                        continue
                    }
                    if (!sc.arrived && h >= sc.arrive && h < sc.leave - .15 && p.presence === `out`) { sc.arrived = !0; beginArrival(p) }
                    else if (!sc.arrived && h >= sc.arrive) sc.arrived = !0;
                    if (!sc.departed && h >= sc.leave) { sc.departed = !0; p.presence === `in` && beginLeave(p) }
                    if (!sc.lunched && sc.arrived && !sc.departed && h >= sc.lunch && h < sc.lunch + .7 && p.presence === `in` && !p.busy) { sc.lunched = !0; beginLunch(p) }
                }
                for (let m2 of DIR.meetings) {
                    if (!m2.fired && h >= m2.h && h < m2.h + 1.3) {
                        m2.fired = !0;
                        let present = m2.parts.filter(p => p.presence === `in` && !p.busy);
                        if (present.length >= 2) {
                            present.forEach(p => (p.metDone = !0, beginMeeting(p, m2.dur)));
                            toastEv(`Scene event: a sprint meeting is underway.`);
                            let tobi = STAFF.find(q => q.formativeEnabled && q.role === `presenter` && q.presence === `in` && !q.busy);
                            tobi && (tobi.busy = !0, tobi.interrupt(),
                            tobi.group.position.y = 0,
                            tobi.goTo(PRESENTER_SPOT[0], PRESENTER_SPOT[1], `Presenting the sprint`),
                            tobi.queue.push({ t: `fn`, fn: () => tobi.standAt(PRESENTER_SPOT[0], PRESENTER_SPOT[1], PRESENTER_SPOT[2], PRESENTER_SPOT[3]) }),
                            tobi.queue.push({ t: `wait`, dur: m2.dur + 4, anim: `standtype`, label: `Presenting the sprint`, bubbles: [`🎤`, `📊`, `💡`, `❓`] }),
                            tobi.queue.push({ t: `fn`, fn: () => {
                                tobi.goTo(tobi.home.x, tobi.home.z, `Back to the corner`);
                                tobi.queue.push({ t: `fn`, fn: () => { tobi.busy = !1 } })
                            } }))
                        }
                    }
                }
                DIR.evT -= dt * SPEED_MULT;
                DIR.evT < 0 && (DIR.evT = a(11, 24), ambientEvent());
                DIR.dlvT -= dt * SPEED_MULT;
                DIR.dlvT < 0 && (DIR.dlvT = a(100, 220), S.hour > 7.4 && S.hour < 19.6 && delivery());
                let streetOn = h >= 6.4 && h < 21.9;
                for (let pd of PEDS)
                    streetOn && pd.presence === `out` ? (pd.presence = `in`, pd.group.visible = !0, (() => {
                        let nn3 = s(PED_NODES);
                        pd.setXZ(nn3[0] + a(-1, 1), nn3[1] + a(-1, 1))
                    })())
                    : !streetOn && pd.presence === `in` && (pd.presence = `out`, pd.group.visible = !1)
            }

            const employeeRolePreferences = {
                frontend: [`frontend`, `designer`, `fullstack`, `mobile`, `techlead`],
                backend: [`backend`, `fullstack`, `sysadmin`, `sre`, `nightops`],
                qa: [`qa`, `devops`, `sre`, `nightops`, `security`],
                database: [`analyst`, `backend`, `mobile`],
                general: [],
            };

            function restoreStaffMember(p) {
                const template = p.formativeTemplate;
                if (!template) return;
                p.name = template.name;
                p.role = template.role;
                p.officeRoleTitle = template.roleTitle;
                p.formativeEmployeeId = undefined;
                p.officeSkills = [];
                p.agentStatus = undefined;
                p.agentSummary = undefined;
                p.formativeEnabled = false;
                p.behave = template.behave;
                p.night = template.night;
                p.baseArrive = template.baseArrive;
                p.baseLeave = template.baseLeave;
                p.params = { ...template.params };
                p.sheet = makeSheet(p.params);
                p.tex.image = p.sheet.canvas;
                p.tex.needsUpdate = true;
                p.tex.offset.x = Math.max(0, p.frame) / p.sheet.frames;
                p.interrupt();
                p.busy = false;
                p.chatReq = null;
                p.pending = null;
                p.presence = `out`;
                p.group.visible = false;
                p.setXZ(p.home.x, p.home.z);
                p.group.position.y = p.y0 || 0;
                p.anim = p.homeAnim;
                p.blob.material.color.setHex(0x000000);
                p.blob.material.opacity = .26;
            }

            function applyProfileToStaff(p, profile, role) {
                const template = p.formativeTemplate;
                const appearance = profile.appearance || {};
                const params = personParams({
                    ...template.params,
                    skin: appearance.skin || template.params.skin,
                    hair: appearance.hair || template.params.hair,
                    shirt: appearance.shirt || template.params.shirt,
                    pants: appearance.pants || template.params.pants,
                    style: appearance.hairStyle || template.params.style,
                    glasses: typeof appearance.glasses === `boolean` ? appearance.glasses : Boolean(template.params.glasses),
                    headset: typeof appearance.headset === `boolean` ? appearance.headset : Boolean(template.params.headset),
                    suit: appearance.suit ? appearance.shirt || template.params.suit || `#2a3550` : null,
                    tie: appearance.tie || template.params.tie || `#c8483e`,
                    cap: appearance.cap || template.params.cap,
                });
                p.name = profile.name;
                p.role = role;
                p.officeRoleTitle = profile.roleTitle;
                p.formativeEmployeeId = profile.id;
                p.officeSkills = Array.isArray(profile.skills) ? [...profile.skills] : [];
                p.agentStatus = undefined;
                p.agentSummary = undefined;
                p.formativeEnabled = true;
                p.behave = template.behave;
                p.night = false;
                p.baseArrive = role === `ceo` ? template.baseArrive : 8.2;
                p.baseLeave = role === `ceo` ? template.baseLeave : 18.6;
                p.params = params;
                p.sheet = makeSheet(params);
                p.tex.image = p.sheet.canvas;
                p.tex.needsUpdate = true;
                p.tex.offset.x = Math.max(0, p.frame) / p.sheet.frames;
            }

            function setAgentActivity(activity = []) {
                const activityByEmployee = new Map();
                for (const item of Array.isArray(activity) ? activity : []) {
                    if (item?.employeeId && item.status && item.summary) activityByEmployee.set(item.employeeId, item);
                }
                for (const p of STAFF) {
                    if (!p.formativeEmployeeId) continue;
                    const item = activityByEmployee.get(p.formativeEmployeeId);
                    if (item) {
                        const changedRun = p.agentStatus !== item.status || p.agentSummary !== item.summary;
                        p.agentStatus = item.status;
                        p.agentSummary = item.summary.slice(0, 240);
                        if (changedRun) {
                            p.interrupt();
                            p.busy = true;
                            p.presence = `in`;
                            p.group.visible = true;
                            placeAtDesk(p);
                        }
                        const color = item.status === `waiting_for_approval` ? 0xe3a43b
                            : item.status === `failed` ? 0xe05e5e
                            : item.status === `completed` ? 0x52a87a
                            : 0x6ea9ef;
                        p.blob.material.color.setHex(color);
                        p.blob.material.opacity = .92;
                    } else if (p.agentStatus) {
                        p.agentStatus = undefined;
                        p.agentSummary = undefined;
                        p.busy = false;
                        p.interrupt();
                        p.blob.material.color.setHex(0x000000);
                        p.blob.material.opacity = .26;
                        const h = S.hour;
                        const inSchedule = p.night ? (h >= p.sched.arrive || h < p.sched.leave) : (h >= p.sched.arrive && h < p.sched.leave);
                        p.presence = inSchedule ? `in` : `out`;
                        p.group.visible = inSchedule;
                        if (inSchedule) placeAtDesk(p);
                        else p.setXZ(p.home.x, p.home.z);
                    }
                }
                if ($?.formativeEmployeeId) callbacks.onSelectPerson?.(getPersonInfo($));
            }

            var lastAppliedTeamSignature = '';
            function computeTeamSignature(team) {
                if (!team) return '';
                const ceo = team.ceo;
                const employees = Array.isArray(team.employees) ? team.employees : [];
                return `${ceo?.id || ''}:${ceo?.name || ''}:${employees.map(e => `${e.id}:${e.name}:${e.enabled}:${e.department}`).join(';')}`;
            }

            function applyOfficeTeam(team) {
                const sig = computeTeamSignature(team);
                if (sig && sig === lastAppliedTeamSignature) {
                    return;
                }
                lastAppliedTeamSignature = sig;
                const ceo = team?.ceo;
                if (ceo) {
                    const ceoActor = STAFF.find(p => p.isCeo || p.role === `ceo` || p.formativeTemplate?.role === `ceo`);
                    if (ceoActor) applyProfileToStaff(ceoActor, ceo, `ceo`);
                }

                // 1. Reset configurable desk bench workers (only desks 0..11)
                const benchStaff = STAFF.filter(p => p.isBench);
                for (const p of benchStaff) {
                    restoreStaffMember(p); // sets presence = 'out', group.visible = false
                }

                // 2. Populate desk bench with enabled project employees
                const employeeProfiles = (Array.isArray(team?.employees) ? team.employees : []).filter(item => item?.enabled).slice(0, MAX_OFFICE_EMPLOYEES);
                const unusedBench = new Set(benchStaff);
                for (const profile of employeeProfiles) {
                    const preferences = employeeRolePreferences[profile.department] || [];
                    const matched = [...unusedBench].find(p => preferences.includes(p.formativeTemplate?.role));
                    const actor = matched || unusedBench.values().next().value;
                    if (!actor) break;
                    unusedBench.delete(actor);
                    const role = profile.department === `general` ? `fullstack` : profile.department;
                    applyProfileToStaff(actor, profile, role);
                    actor.presence = `in`;
                    actor.group.visible = true;
                    placeAtDesk(actor);
                }

                // 3. Keep Facility / Ambient Staff intact and visible!
                const facilityStaff = STAFF.filter(p => p.isFacility);
                for (const p of facilityStaff) {
                    p.formativeEnabled = true;
                    const h = S.hour;
                    const inSchedule = p.night ? (h >= p.sched.arrive || h < p.sched.leave) : (h >= p.sched.arrive && h < p.sched.leave);
                    p.presence = inSchedule ? `in` : `out`;
                    p.group.visible = inSchedule;
                }

                DIR.day = S.day;
                rollDay();
                presenceSnap();
                setAgentActivity(currentAgentActivity);
                if ($ && !$.group.visible) na();
                else if ($) callbacks.onSelectPerson?.(getPersonInfo($));
            }

            var currentAgentActivity = [];
            const setOfficeAgentActivity = (activity) => {
                currentAgentActivity = Array.isArray(activity) ? activity : [];
                setAgentActivity(currentAgentActivity);
            };

            /* init the clock-driven schedules without moving the pre-placed cast */
            DIR.day = S.day;
            rollDay();
            /* night crew starts out-of-office unless the boot hour falls inside their shift */
            for (let p of STAFF) if (p.night && !(S.hour >= p.sched.arrive || S.hour < p.sched.leave)) { p.presence = `out`, p.group.visible = !1, p.setXZ(p.home.x, p.home.z) }
            for (let p of STAFF) {
                let sc = p.sched;
                sc.arrived = p.night ? (S.hour >= sc.arrive || S.hour < sc.leave) : S.hour >= sc.arrive;
                sc.departed = p.night ? (S.hour >= sc.leave && S.hour < 12) : S.hour >= sc.leave;
                sc.lunched = !(S.hour >= sc.lunch && S.hour < sc.lunch + .8) && S.hour >= sc.lunch;
                p.meetAt != null && S.hour >= p.meetAt && (p.metDone = !0)
            }
            if (initialTeam) applyOfficeTeam(initialTeam);

            /* ================= DAY / NIGHT ================= */

            var pi = [[0, `#0a0f2c`, `#1f2457`, `#7f95ff`, .55, `#3a4a8a`, `#141626`, .5, `#5d6aa8`, 0], [4.8, `#121a42`, `#3a3466`, `#8f9cff`, .45, `#45508a`, `#1a1a2a`, .5, `#6670aa`, 0], [6.2, `#6b84c4`, `#f4b9b4`, `#ffc39b`, .9, `#9fb4ef`, `#6a5560`, .85, `#c9c0dc`, .45], [8, `#78b2ec`, `#d7ebf7`, `#fff0dc`, 1.8, `#b6d4f5`, `#6f7058`, 1, `#f2f0f4`, .85], [12, `#4b9ff0`, `#c3e6ff`, `#ffffff`, 2.5, `#c4e0ff`, `#73705a`, 1.05, `#ffffff`, 1], [15.5, `#5aa3ea`, `#e2eecd`, `#fff2d8`, 2.2, `#c0daf5`, `#76705a`, 1, `#fffaf0`, 1], [17.6, `#6d7fc5`, `#ffb877`, `#ffa24e`, 2.1, `#ffc8a0`, `#7a5038`, .8, `#ffe0b8`, .75], [18.8, `#3c3a7c`, `#f07d6a`, `#ff7a4a`, .85, `#c28ab0`, `#4a3040`, .7, `#d8a8b8`, .35], [20, `#141a48`, `#3a2f68`, `#8f9cff`, .5, `#4a5090`, `#1a1a2a`, .55, `#7078b0`, .04], [24, `#0a0f2c`, `#1f2457`, `#7f95ff`, .55, `#3a4a8a`, `#141626`, .5, `#5d6aa8`, 0]].map(t => ({
                h: t[0],
                top: new e.Color(t[1]),
                bot: new e.Color(t[2]),
                sun: new e.Color(t[3]),
                sunI: t[4],
                hs: new e.Color(t[5]),
                hg: new e.Color(t[6]),
                hI: t[7],
                tint: new e.Color(t[8]),
                day: t[9]
            }))
              , Y = { top: new e.Color, bot: new e.Color, sun: new e.Color, hs: new e.Color, hg: new e.Color, tint: new e.Color, sunI: 0, hI: 0, day: 0 };

            function mi(h) {
                let t = 0;
                for (; t < pi.length - 2 && h >= pi[t + 1].h; )
                    t++;
                let i = pi[t]
                  , a = pi[t + 1]
                  , o = n((h - i.h) / (a.h - i.h), 0, 1);
                for (let e of [`top`, `bot`, `sun`, `hs`, `hg`, `tint`])
                    Y[e].lerpColors(i[e], a[e], o);
                Y.sunI = r(i.sunI, a.sunI, o),
                Y.hI = r(i.hI, a.hI, o),
                Y.day = r(i.day, a.day, o)
            }

            var hi = new e.Color(`#8a90a0`)
              , gi = new e.Color(`#6b7382`)
              , _i = new e.Color
              , vi = new e.Color
              , yi = new e.Color
              , bi = new e.Color
              , xi = new e.Vector3
              , eveningLightDirection = new e.Vector3(.3, .8, .5).normalize()
              , X = { r: 0, g: 0, b: 0 }
              , Si = new e.Color(`#e6e9ef`)
              , Ci = new e.Color(`#dfe4ea`)
              , wi = new e.Color(`#ffb060`)
              , Ti = new e.Color(`#ffffff`)
              , Z = { hour: 12, day: 1, night: 0, golden: 0, tint: new e.Color(1, 1, 1) };

            function envUpdate(dt, t) {
                let h = S.hour;
                mi(h);
                _i.copy(Y.top).lerp(gi, .25),
                vi.copy(Y.bot).lerp(hi, .22),
                _i.getRGB(X, e.SRGBColorSpace),
                E.uniforms.uTop.value.set(X.r, X.g, X.b),
                vi.getRGB(X, e.SRGBColorSpace),
                E.uniforms.uBot.value.set(X.r, X.g, X.b),
                T.fog.color.copy(vi).lerp(Ci, .3 * Y.day),
                T.fog.near = ce + 45,
                T.fog.far = ce + 155;
                let m = (h - 6) / 12 * Math.PI
                  , g2 = Math.sin(m)
                  , g = xi.set(Math.cos(m) * .9, Math.max(g2, .16), .45).normalize()
                  , _ = i(.12, -.1, g2);
                g.lerp(eveningLightDirection, _).normalize(),
                N.position.copy(N.target.position).addScaledVector(g, 90),
                N.color.copy(Y.sun),
                N.intensity = Y.sunI * 1.35,
                ut.color.copy(Y.hs),
                ut.groundColor.copy(Y.hg),
                ut.intensity = Y.hI * 1.45;
                let vv = Y.day;
                Z.hour = h,
                Z.day = Y.day,
                Z.night = i(.35, .05, vv),
                Z.golden = Math.exp(-(((h - 17.7) / 1) ** 2)),
                Z.tint.copy(Y.tint);
                for (let m2 of personMats)
                    m2.color.copy(Z.tint);
                /* interior lamps fade in at dusk */
                let lampLvl = i(.62, .28, vv);
                for (let lm of LAMPS)
                    lm.set(lampLvl);
                ft.uLampOn.value = lampLvl;
                for (let g3 of nightGlow) {
                    let lvl = i(g3.th + .18, g3.th - .3, vv);
                    g3.mat.emissiveIntensity = lvl * g3.k
                }
                for (let hl of halos)
                    hl.spr.material.opacity = i(hl.th + .2, hl.th - .25, vv) * .55 * hl.k;
                E.uniforms.uStars.value = Z.night * .9,
                E.uniforms.uExposure.value = r(1.05, .92, 0),
                E.uniforms.uSat.value = r(1.14, 1.05, Z.night);
                let y2 = E.uniforms;
                y2.uCloud.value = .38 + Math.sin(t * .008) * .12,
                y2.uPan.value = se,
                yi.copy(Ti).lerp(Y.sun, .35).multiplyScalar(r(.1, 1, Y.day)).lerp(bi.set(`#2c3366`), (1 - Y.day) * .55),
                yi.lerp(bi.set(`#a3a8b4`).multiplyScalar(r(.2, 1, Y.day)), .1),
                bi.copy(yi).multiplyScalar(.7).lerp(vi, .3),
                yi.getRGB(X, e.SRGBColorSpace),
                y2.uCloudLit.value.set(X.r, X.g, X.b),
                bi.getRGB(X, e.SRGBColorSpace),
                y2.uCloudShade.value.set(X.r, X.g, X.b)
            }


  /* ================= UI INTERACTION & ADAPTATION ================= */
  function Ki(h) {
    return h < 5 || h >= 20.5 ? 'moon' : h < 7.5 || (h >= 16.8 && h < 19.5) ? 'sunrise' : 'sun';
  }

  const DEFAULT_ROLE_SKILLS: Record<string, string[]> = {
    ceo: ['Task Planning', 'Context Routing', 'Tool Orchestration', 'Code Synthesis'],
    reception: ['Guest Welcoming', 'Front Desk', 'Mail & Packages', 'Office Logistics'],
    sysadmin: ['Linux Racks', 'Network Switches', 'Cooling & Power', 'Terminal Ops', 'Infrastructure'],
    presenter: ['System Pitches', 'Architecture Demos', 'Keynotes', 'Tech Talks'],
    backend: ['Distributed Systems', 'API Services', 'Database Optimization', 'Node/Python'],
    designer: ['UI/UX Polish', 'Design Systems', 'Interface Ergonomics', 'Visual Polish'],
    analyst: ['Telemetry Analysis', 'Data Pipelines', 'Metrics & Reporting'],
    mobile: ['iOS & Android', 'React Native', 'Swift', 'Mobile APIs'],
    techlead: ['System Architecture', 'Technical Strategy', 'RFCs', 'Mentorship'],
    sre: ['Uptime & Monitoring', 'CI/CD Pipelines', 'Incident Response'],
    officemgr: ['Facilities Management', 'Team Culture', 'Snack Inventory', 'Events'],
    visitor: ['Neighborhood Regular', 'Coffee Connoisseur', 'Sidewalk Strolling'],
    frontend: ['React Components', 'Tailwind CSS', 'Accessibility', 'State Management'],
    fullstack: ['Full-stack Integration', 'Hotfixes', 'End-to-End Architecture'],
    qa: ['Unit Testing', 'E2E Testing', 'Build Verification', 'Regression Tests'],
  };

  function findPersonInRoster(idOrName?: string | null) {
    if (!idOrName) return null;
    const clean = idOrName.toLowerCase();
    return ROSTER.find(p => 
      p.formativeEmployeeId === idOrName ||
      (p.name && p.name.toLowerCase() === clean) ||
      (p.name && `person-${p.name.toLowerCase()}` === clean) ||
      (p.role === 'ceo' && idOrName === 'emp-ceo')
    ) || null;
  }

  function getPersonInfo(p) {
    if (!p) return null;
    return {
      name: p.name,
      role: p.role,
      roleTitle: p.officeRoleTitle || ROLES[p.role] || p.role,
      employeeId: p.formativeEmployeeId || (p.role === 'ceo' ? 'emp-ceo' : `person-${p.name.toLowerCase()}`),
      agentStatus: p.agentStatus,
      agentSummary: p.agentSummary,
      skills: Array.isArray(p.officeSkills) && p.officeSkills.length > 0 ? [...p.officeSkills] : (DEFAULT_ROLE_SKILLS[p.role] || []),
      act: p.agentSummary || p.label,
      mood: moodFor(S.hour),
      track: p.track,
      steps: Math.floor(p.steps),
      coffees: p.coffees,
      energyPct: Math.round(n(p.energy - (p.steps - 3e3) / 6e4 + p.coffees * .04, .08, 1) * 100),
      drawPortrait(targetCanvas) {
        if (!targetCanvas || !p.sheet) return;
        let ctx = targetCanvas.getContext('2d');
        if (!ctx) return;
        let sh = p.sheet;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 64, 96);
        let sc = Math.min(64 / sh.fw, 96 / sh.fh);
        let w2 = sh.fw * sc;
        let h2 = sh.fh * sc;
        ctx.drawImage(sh.canvas, Math.max(0, p.frame) * sh.fw, 0, sh.fw, sh.fh, (64 - w2) / 2, 96 - h2 - 4, w2, h2);
      }
    };
  }

  function Ui(msg) {
    callbacks.onToast && callbacks.onToast(msg);
  }

  /* Raycasting & Selection */
  var $ = null;
  var $i = new e.Raycaster();
  var ea = new e.Vector2();
  var ta = null;

  function na() {
    $ = null;
    callbacks.onSelectPerson && callbacks.onSelectPerson(null);
  }

  const onPointerDown = (ev: PointerEvent) => {
    ta = [ev.clientX, ev.clientY];
  };

  const onPointerUp = (ev: PointerEvent) => {
    if (!ta || Math.hypot(ev.clientX - ta[0], ev.clientY - ta[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    ea.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    $i.setFromCamera(ea, ie);
    let hit = $i.intersectObjects(spriteMeshes.filter(s2 => s2.parent && s2.parent.parent && s2.parent.parent.visible), false)[0];
    if (hit) {
      $ = hit.object.userData.agent;
      if ($) {
        // If clicked on an animal (cat or dog), show pre-configured speech bubble and do not open chat
        if ($.kind === 'cat' || $.kind === 'dog' || $.role === 'cat' || $.role === 'dog') {
          const isDog = $.kind === 'dog' || $.role === 'dog';
          const petBarks = isDog
            ? ['Woof! 🐶', 'Arf arf! *wags tail*', 'Pant pant! Happy to see you! 🎾', 'Bork! *excited wiggle*', 'Arf! 🐕']
            : ['Meow! 🐱', 'Purrrrr...', 'Prrrbt! *stretches*', '*rubs against your leg* :3', 'Meow? *slow blink*', 'Zzz... 🐾'];
          $.sayText(s(petBarks), 3.5);
          na();
          return;
        }

        callbacks.onSelectPerson && callbacks.onSelectPerson(getPersonInfo($));
        $.say(s(['💬', '👋', '✨', '💻']), 1.6);
      }
    } else {
      na();
    }
  };

  var hoverT = 0;
  const onPointerMove = (ev: PointerEvent) => {
    let now = performance.now();
    if (now - hoverT < 90) return;
    hoverT = now;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    ea.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    $i.setFromCamera(ea, ie);
    canvas.style.cursor = $i.intersectObjects(spriteMeshes, false).length ? 'pointer' : '';
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.target && (ev.target as HTMLElement).closest && (ev.target as HTMLElement).closest('input,textarea')) return;
    if (ev.key === 'Escape') {
      na();
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('keydown', onKeyDown);

  const onWindowResize = () => {
    if (!isDestroyed) {
      Se();
    }
  };
  window.addEventListener('resize', onWindowResize);

              /* ================= MAIN LOOP ================= */

            var oa = performance.now()
              , sa = 0
              , ca = 0
              , la = 0
              , ua = 0
              , ji = () => {
                let d = new Date;
                return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
            };

            function ma(now) {
    if (isDestroyed) return;
                if (window.__freeze) { animId = requestAnimationFrame(ma); return }
                try {
                let dt = n((now - oa) / 1e3, 0, .05);
                oa = now,
                sa += dt,
                SPEED_MULT = S.speed >= 300 ? 2.6 : S.speed >= 60 ? 1.5 : 1;
                /* time progression */
                if (S.live)
                    S.hour = ji();
                else {
                    let prev = S.hour;
                    S.hour = (S.hour + dt * S.speed / 3600) % 24,
                    S.hour < prev && (S.day = (S.day || 1) + 1)
                }
                /* Clock and stats update (4x per second) */
ca -= dt;
if (ca < 0) {
    ca = 0.25;
    let on = 0;
    for (let p of STAFF) p.group.visible && on++;
    let h = Math.floor(S.hour) % 24;
    let mn = Math.floor((S.hour % 1) * 60);
    let timeStr = String(h % 24).padStart(2, '0') + ':' + String(mn).padStart(2, '0');
    let ic = Ki(S.hour);
    let h2 = S.hour;
    let modeStr = h2 < 7 ? 'night shift' : h2 < 9 ? 'warming up' : h2 < 12 ? 'office hours' : h2 < 13.5 ? 'lunch vibes' : h2 < 18 ? 'office hours' : h2 < 22 ? 'overtime' : 'night shift';
    callbacks.onStatsUpdate && callbacks.onStatsUpdate({
        floorCount: on,
        day: S.day || 1,
        mode: modeStr,
        hour: S.hour,
        timeStr,
        icon: ic
    });
}
                if (camPan) {
                    camPan.t += dt;
                    let progress = Math.min(1, camPan.t / camPan.dur);
                    let ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    if (camPan.person) {
                        camPan.targetX = camPan.person.x;
                        camPan.targetZ = camPan.person.z;
                    }
                    ae.target.x = camPan.startX + (camPan.targetX - camPan.startX) * ease;
                    ae.target.z = camPan.startZ + (camPan.targetZ - camPan.startZ) * ease;
                    if (camPan.startDist && camPan.targetDist) {
                        let newDist = camPan.startDist + (camPan.targetDist - camPan.startDist) * ease;
                        le.setLength(newDist);
                        ie.position.copy(ae.target).add(le);
                    }
                    if (progress >= 1) {
                        camPan = null;
                    }
                } else if (trackedTargetPerson) {
                    let follow = Math.min(1, dt * 6.0);
                    ae.target.x += (trackedTargetPerson.x - ae.target.x) * follow;
                    ae.target.z += (trackedTargetPerson.z - ae.target.z) * follow;
                    ie.position.copy(ae.target).add(le);
                }
                ue();
                envUpdate(dt, sa);
                /* animated textures */
                for (let at of animTexs)
                    at.t -= dt,
                    at.t < 0 && (at.t = at.iv, at.upd());
                /* scenery motion */
                for (let f of fans)
                    f.rotation.z += dt * 9;
                for (let t2 of kt) {
                    let amt = .012;
                    t2.crown.rotation.z = Math.sin(sa * 1.3 + t2.ph) * amt,
                    t2.crown.rotation.x = Math.sin(sa * 1.05 + t2.ph * 1.7) * amt * .7
                }
                flag.rotation.y = .55 + Math.sin(sa * 2) * .14,
                flag.rotation.z = Math.sin(sa * 1.3) * .05;
                for (let c2 of cars) {
                    c2.x += c2.v * dt;
                    let nx = c2.x > 118 ? -118 : c2.x < -118 ? 118 : c2.x;
                    c2.x = nx,
                    c2.g.position.set(c2.x, 0, c2.lane),
                    c2.g.rotation.y = c2.dir < 0 ? Math.PI : 0,
                    c2.g.visible = Math.abs(c2.x) < 117
                }
                for (let st of steam) {
                    st.ph = (st.ph + dt * .42) % 1;
                    let y2 = 1.16 + st.ph * .55;
                    st.spr.position.set(st.x + Math.sin(st.ph * 9 + st.ph) * .07, y2, st.z + Math.sin(st.ph * 6) * .03),
                    st.spr.material.opacity = Math.sin(st.ph * Math.PI) * .32,
                    st.spr.scale.setScalar(.13 + st.ph * .16)
                }
                /* people */
                for (let p of ROSTER) {
                    if (!p.group.visible) continue;
                    p.update(dt);
                    p.billboard();
                }
                /* scripted office life */
                directorUpdate(dt);
                /* atmosphere: leaves, dust, fireflies */
                let usc = xe.y / (2 * Math.tan(ie.fov * Math.PI / 360));
                leafPts.mat.uniforms.uScale.value = usc;
                dustPts.mat.uniforms.uScale.value = usc;
                ffPts.mat.uniforms.uScale.value = usc;
                ptlPts.mat.uniforms.uScale.value = usc;
                leafPts.mat.uniforms.uTint.value.copy(Z.tint);
                leafPts.mat.uniforms.uTintAmt.value = 1;
                ptlPts.mat.uniforms.uTint.value.copy(Z.tint);
                ptlPts.mat.uniforms.uTintAmt.value = 1;
                updLeaves(dt, sa);
                updDust(dt, sa, Z.day);
                updFireflies(dt, sa, Z.night);
                /* the wide-world ambience: petals, butterflies, birds, pond + chimney */
                updPetals(dt, sa);
                updBflies(dt, sa);
                updBirds(dt, sa);
                for (let wm of WATERS)
                    wm.uniforms.uTime.value = sa,
                        wm.uniforms.uTint.value.copy(Z.tint),
                        wm.uniforms.uFogC.value.copy(T.fog.color),
                        wm.uniforms.uFogN.value = T.fog.near,
                        wm.uniforms.uFogF.value = T.fog.far;
                for (let sm of SMOKE) {
                    sm.ph = (sm.ph + dt * .16) % 1;
                    sm.spr.position.set(-70.9 + sm.ph * 1.3 + Math.sin(sm.ph * 7) * .1, 3.85 + sm.ph * 2.6, -52.6 + Math.sin(sm.ph * 5) * .12),
                        sm.spr.material.opacity = Math.sin(sm.ph * Math.PI) * .2,
                        sm.spr.scale.setScalar(.4 + sm.ph * 1.1)
                }
                /* selected card refresh */
                if ($) {
    la -= dt;
    if (la < 0) {
        la = 0.25;
        callbacks.onSelectPerson && callbacks.onSelectPerson(getPersonInfo($));
    }
}
                /* shadows at 15fps */
                ua -= dt,
                ua < 0 && (ua = 1 / 15, w.shadowMap.needsUpdate = !0);
                /* Render the layered pixel-art finish when supported. If a driver
                   rejects an off-screen target, keep the office visible directly. */
                if (postProcessingEnabled) {
                  try {
                    w.setRenderTarget(de);
                    w.render(T, ie);
                    ye.material = he;
                    he.uniforms.tDiffuse.value = de.texture;
                    w.setRenderTarget(fe);
                    w.render(_e, ve);
                    ye.material = ge;
                    w.setRenderTarget(pe);
                    w.render(_e, ve);
                    ye.material = E;
                    E.uniforms.tDiffuse.value = fe.texture;
                    w.setRenderTarget(null);
                    w.render(_e, ve);
                  } catch (error) {
                    postProcessingEnabled = false;
                    T.background = Y.top.clone();
                    w.setRenderTarget(null);
                    if (!renderErrorReported) {
                      callbacks.onRenderError?.('Using basic rendering because this device could not start the office display effects.', error);
                    }
                    try {
                      w.clear();
                      w.render(T, ie);
                    } catch (fallbackError) {
                      console.error('Formative office basic rendering failed.', fallbackError);
                      callbacks.onRenderError?.('The graphics driver could not render the office scene. Restart Formative after updating your graphics driver.', fallbackError);
                      return;
                    }
                  }
                } else {
                  w.setRenderTarget(null);
                  w.render(T, ie);
                }
                if (!isDestroyed) { animId = requestAnimationFrame(ma); }
                } catch (error) {
                  console.error('Formative office scene stopped unexpectedly.', error);
                  if (!renderErrorReported) {
                    renderErrorReported = true;
                    callbacks.onRenderError?.('The office scene stopped unexpectedly. Restart the office view to try again.', error);
                  }
                }
            }

  Se();
  animId = requestAnimationFrame(ma);

  return {
    setHour(h: number) {
      S.hour = n(h, 0, 24);
      presenceSnap();
    },
    setLive(v: boolean) {
      S.live = v;
      if (v) S.speed = 1;
      presenceSnap();
    },
    setSpeed(spd: number) {
      S.speed = spd;
    },
    setTilt(tilt: number) {
      S.tilt = tilt;
      u.set('tilt', tilt);
      if (he && E) {
        he.uniforms.uAmount.value = E.uniforms.uAmount.value = tilt;
      }
    },
    setResolution(res: number) {
      S.res = res;
      u.set('res', res);
      Se();
    },
    setEmployees(team: ProjectOfficeTeam) {
      applyOfficeTeam(team);
    },
    setAgentActivity(activity: OfficeAgentActivity[]) {
      setOfficeAgentActivity(activity);
    },
    centerCamera() {
      ae.target.set(0, .4, -1);
      ie.position.setFromSpherical(new e.Spherical(re, .96, .5)).add(ae.target);
      ae.update();
    },
    focusEmployee(employeeId?: string, zoomIn = true) {
      let target = findPersonInRoster(employeeId);
      if (!target && $) {
        target = $;
      }
      if (!target) {
        target = STAFF.find(p => p.role === `ceo`) || STAFF[0];
      }
      if (target) {
        $ = target;
        callbacks.onSelectPerson && callbacks.onSelectPerson(getPersonInfo(target));
        let curDist = le.length();
        let targetDist = (zoomIn && curDist > 75) ? 68 : curDist;
        camPan = {
          startX: ae.target.x,
          startZ: ae.target.z,
          startDist: curDist,
          targetDist: targetDist,
          person: target,
          targetX: target.x,
          targetZ: target.z,
          t: 0,
          dur: 0.85
        };
      }
    },
    setCameraTrackTarget(employeeId: string | null) {
      if (!employeeId) {
        trackedTargetPerson = null;
        return;
      }
      let target = findPersonInRoster(employeeId);
      if (!target && $) target = $;
      trackedTargetPerson = target || null;
    },
    showSpeechBubble(employeeId: string, text: string, dur = 8.0) {
      let p = findPersonInRoster(employeeId);
      if (!p && $) p = $;
      if (!p) p = STAFF.find(person => person.role === `ceo`);
      if (p && p.sayText) {
        p.sayText(text, dur);
      } else if (p && p.say) {
        p.say(text, dur);
      }
    },
    getPersonScreenCoords(employeeId?: string) {
      let p = employeeId ? findPersonInRoster(employeeId) : $;
      if (!p) return null;
      let headY = (p.anim === `sit` || p.anim === `sitsip` || p.anim === `sittype`) ? 1.4 : 1.75;
      let v = new e.Vector3(p.x, p.group.position.y + headY, p.z);
      v.project(ie);
      let rect = canvas.getBoundingClientRect();
      let x = (v.x * 0.5 + 0.5) * rect.width;
      let y = (-v.y * 0.5 + 0.5) * rect.height;
      return {
        x,
        y,
        visible: p.group.visible && v.z < 1,
        name: p.name,
        role: p.officeRoleTitle || ROLES[p.role] || p.role,
        employeeId: p.formativeEmployeeId
      };
    },
    resize(w?: number, h?: number) {
      Se(w, h);
    },
    deselect() {
      na();
    },
    destroy() {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onWindowResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      try {
        ae.dispose();
        w.dispose();
        de.dispose();
        fe.dispose();
        pe.dispose();
      } catch (_) {}
    },
    getHour() { return S.hour; },
    getLive() { return S.live; },
    getSpeed() { return S.speed; },
    getTilt() { return S.tilt; },
    getResolution() { return S.res; }
  };
}
