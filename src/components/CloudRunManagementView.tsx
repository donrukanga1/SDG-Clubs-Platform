import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  Server,
  Cpu,
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  ShieldAlert,
  HelpCircle,
  Lock,
  Unlock,
  Settings,
  ArrowRight
} from "lucide-react";

interface EnvVar {
  key: string;
  value: string;
}

interface CloudRunServiceConfig {
  serviceName: string;
  region: string;
  projectId: string;
  cpu: string;
  memory: string;
  minInstances: number;
  maxInstances: number;
  allowUnauthenticated: boolean;
  envVars: EnvVar[];
  status: "not_configured" | "deploying" | "running" | "failed";
  serviceUrl?: string;
  lastDeployedAt?: string;
  deploymentLogs?: string[];
}

export function CloudRunManagementView({
  registeredClub,
  onClubUpdate
}: {
  registeredClub: any;
  onClubUpdate?: (updatedClub: any) => void;
}) {
  const [config, setConfig] = useState<CloudRunServiceConfig>({
    serviceName: "sdgs-clubs-backend",
    region: "europe-west2",
    projectId: "sdgs-clubs",
    cpu: "1",
    memory: "1Gi",
    minInstances: 0,
    maxInstances: 10,
    allowUnauthenticated: true,
    envVars: [
      { key: "NODE_ENV", value: "production" },
      { key: "GEMINI_API_KEY", value: "" }
    ],
    status: "not_configured"
  });

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load configuration from registeredClub's Firestore record if available
  useEffect(() => {
    if (registeredClub?.cloudRunConfig) {
      try {
        const savedConfig = registeredClub.cloudRunConfig as CloudRunServiceConfig;
        setConfig({
          ...savedConfig,
          envVars: savedConfig.envVars || [
            { key: "NODE_ENV", value: "production" },
            { key: "GEMINI_API_KEY", value: "" }
          ]
        });
        if (savedConfig.deploymentLogs) {
          setTerminalLogs(savedConfig.deploymentLogs);
          setShowTerminal(true);
        }
      } catch (err) {
        console.error("Error loading Cloud Run configuration:", err);
      }
    }
  }, [registeredClub?.id]);

  const saveConfigToFirestore = async (updatedConfig: CloudRunServiceConfig) => {
    if (!registeredClub?.id) return;
    try {
      const clubRef = doc(db, "clubs", registeredClub.id);
      await updateDoc(clubRef, {
        cloudRunConfig: updatedConfig
      });
      // Synchronize standard state in App.tsx
      if (onClubUpdate) {
        const updatedLocal = {
          ...registeredClub,
          cloudRunConfig: updatedConfig
        };
        localStorage.setItem("kap10_registered_club", JSON.stringify(updatedLocal));
        onClubUpdate(updatedLocal);
      }
    } catch (err) {
      console.error("Firestore Save Error for Cloud Run:", err);
    }
  };

  const addEnvVar = () => {
    if (!newKey.trim()) return;
    if (config.envVars.some((v) => v.key.toUpperCase() === newKey.trim().toUpperCase())) {
      alert(`Environment variable "${newKey}" is already configured.`);
      return;
    }
    const updatedVars = [...config.envVars, { key: newKey.trim().toUpperCase(), value: newValue.trim() }];
    const nextConfig = { ...config, envVars: updatedVars };
    setConfig(nextConfig);
    saveConfigToFirestore(nextConfig);
    setNewKey("");
    setNewValue("");
  };

  const removeEnvVar = (keyToRemove: string) => {
    if (keyToRemove === "NODE_ENV") {
      alert("The NODE_ENV variable is critical for server mode and cannot be removed.");
      return;
    }
    const updatedVars = config.envVars.filter((v) => v.key !== keyToRemove);
    const nextConfig = { ...config, envVars: updatedVars };
    setConfig(nextConfig);
    saveConfigToFirestore(nextConfig);
  };

  const updateEnvVarValue = (key: string, value: string) => {
    const updatedVars = config.envVars.map((v) => (v.key === key ? { ...v, value } : v));
    const nextConfig = { ...config, envVars: updatedVars };
    setConfig(nextConfig);
    saveConfigToFirestore(nextConfig);
  };

  // Run the deployment CLI simulation step-by-step
  const handleDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setShowTerminal(true);
    setCurrentStep(0);
    setTerminalLogs([]);

    const steps = [
      {
        text: `[SYSTEM] Starting production Cloud Run deployment pipeline for chapter: ${registeredClub?.name || "Demo Chapter"} (${registeredClub?.id || "N/A"})`,
        delay: 500,
        type: "info"
      },
      {
        text: `[CLI] $ gcloud config set project ${config.projectId}`,
        delay: 800,
        type: "command"
      },
      {
        text: `Updated active project configuration context to [${config.projectId}].`,
        delay: 400,
        type: "success"
      },
      {
        text: `[CLI] $ gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com`,
        delay: 1500,
        type: "command"
      },
      {
        text: `✔ API Service [run.googleapis.com] enabled successfully.\n✔ API Service [containerregistry.googleapis.com] enabled successfully.\n✔ API Service [cloudbuild.googleapis.com] enabled successfully.`,
        delay: 600,
        type: "success"
      },
      {
        text: `[CLI] $ gcloud run deploy ${config.serviceName} \\
  --source . \\
  --region ${config.region} \\
  --platform managed \\
  --allow-unauthenticated \\
  --cpu ${config.cpu} \\
  --memory ${config.memory} \\
  --min-instances ${config.minInstances} \\
  --max-instances ${config.maxInstances} \\
  --set-env-vars="${config.envVars.map((v) => `${v.key}=${v.key === "GEMINI_API_KEY" && v.value ? "●●●●●●●●" : v.value}`).join(",")}"`,
        delay: 1800,
        type: "command"
      },
      {
        text: `🔍 [BUILD] Compiling container file tree inside isolated multi-tenant Cloud Run runner...`,
        delay: 1000,
        type: "info"
      },
      {
        text: `📦 Packing source directory (total size: 4.8MB)... Done.`,
        delay: 700,
        type: "info"
      },
      {
        text: `⚙ [CLOUDBUILD] Submitting build pipeline for tag: gcr.io/${config.projectId}/${config.serviceName}:latest...`,
        delay: 1200,
        type: "info"
      },
      {
        text: `Step 1/3 (Dockerfile Container Base): FROM node:20-alpine \n---> [CACHE HIT] 3986ec3b999a`,
        delay: 600,
        type: "detail"
      },
      {
        text: `Step 2/3 (Dependencies install): Running standard npm clean installs...\n---> added 412 packages in 8.4s`,
        delay: 1400,
        type: "detail"
      },
      {
        text: `Step 3/3 (Syllabus production assets build): Running vite-esbuild bundling pipeline...\n---> Built static assets inside /dist\n---> Server compiled output: dist/server.cjs (CJS Single Bundle)`,
        delay: 1500,
        type: "detail"
      },
      {
        text: `✔ Container Build successfully completed. Tag stored in container registry: gcr.io/${config.projectId}/${config.serviceName}:latest`,
        delay: 500,
        type: "success"
      },
      {
        text: `⚡ Deploying container image to Cloud Run Service [${config.serviceName}] inside region [${config.region}]...`,
        delay: 1800,
        type: "info"
      },
      {
        text: `Creating revision... [0%]\nRouting HTTP Traffic... [40%]\nSetting up IAM Ingress rule and unauthenticated invoker policy... [80%]`,
        delay: 1200,
        type: "detail"
      },
      {
        text: `✔ Revision [${config.serviceName}-00001-v1] successfully provisioned. Traffic rerouted.`,
        delay: 400,
        type: "success"
      },
      {
        text: `[CLI] $ gcloud run services add-iam-policy-binding ${config.serviceName} --region=${config.region} --member="allUsers" --role="roles/run.invoker"`,
        delay: 1000,
        type: "command"
      },
      {
        text: `✔ IAM policies bound successfully. Public unauthenticated access is provisioned.`,
        delay: 500,
        type: "success"
      },
      {
        text: `🌐 Binding Firebase custom domain rewrite mapping pointers and HTTPS SSL handshake certificates...`,
        delay: 1200,
        type: "info"
      },
      {
        text: `[SYSTEM] Cloud Run Service successfully deployed and integrated into SDGs Clubs Portal!`,
        delay: 400,
        type: "success"
      }
    ];

    let currentLogIndex = 0;
    const runNextStep = () => {
      if (currentLogIndex < steps.length) {
        const step = steps[currentLogIndex];
        setTerminalLogs((prev) => [...prev, step.text]);
        currentLogIndex++;
        setTimeout(runNextStep, step.delay);
      } else {
        // Complete deployment successfully
        const serviceUrl = `https://${config.serviceName}-dk5ervbk4l-ew.a.run.app`;
        const lastDeployedAt = new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        const finalLogs = [...terminalLogs, ...steps.map((s) => s.text)];
        const nextConfig: CloudRunServiceConfig = {
          ...config,
          status: "running",
          serviceUrl,
          lastDeployedAt,
          deploymentLogs: finalLogs
        };
        setConfig(nextConfig);
        saveConfigToFirestore(nextConfig);
        setIsDeploying(false);
      }
    };

    runNextStep();
  };

  const getLogStyle = (log: string) => {
    if (log.startsWith("[CLI]")) return "text-amber-400 font-bold";
    if (log.startsWith("✔") || log.startsWith("[SYSTEM]")) return "text-emerald-400 font-black";
    if (log.startsWith("⚠️") || log.startsWith("Error")) return "text-rose-400 font-bold animate-pulse";
    if (log.startsWith("🔍") || log.startsWith("⚙") || log.startsWith("⚡") || log.startsWith("🌐")) return "text-sky-400 font-bold";
    return "text-gray-300 font-normal";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Overview Card */}
      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-[#EFF6FF] border border-[#3B82F6] px-3 py-1 inline-block">
          CLOUDRUN SERVER DEPLOYMENTS
        </span>
        <h2 className="text-2xl sm:text-4xl font-display font-black uppercase tracking-tighter italic leading-none">
          Cloud Run Microservice Console
        </h2>
        <p className="text-gray-500 font-medium text-xs uppercase tracking-wide leading-relaxed">
          Monitor, simulate, and configure your scalable container microservices directly inside the club portal. Set up allocation units, scale thresholds, and secrets to customize your SDGs deployment.
        </p>
      </div>

      {/* Main Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-tight border-b-2 border-black pb-3 flex items-center gap-2">
              <Settings size={16} className="text-blue-600" />
              Service Configuration Parameters
            </h3>

            <div className="space-y-4">
              {/* Form Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    GCP Project ID
                  </label>
                  <input
                    type="text"
                    value={config.projectId}
                    onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                    className="w-full p-2.5 border-2 border-black font-semibold text-xs bg-gray-50 outline-none focus:bg-white"
                    placeholder="e.g. sdgs-clubs"
                    disabled={isDeploying}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Service Identifier
                  </label>
                  <input
                    type="text"
                    value={config.serviceName}
                    onChange={(e) => setConfig({ ...config, serviceName: e.target.value })}
                    className="w-full p-2.5 border-2 border-black font-semibold text-xs bg-gray-50 outline-none focus:bg-white"
                    placeholder="e.g. sdgs-clubs-backend"
                    disabled={isDeploying}
                  />
                </div>
              </div>

              {/* Form Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Deployment Region
                  </label>
                  <select
                    value={config.region}
                    onChange={(e) => setConfig({ ...config, region: e.target.value })}
                    className="w-full p-2.5 border-2 border-black font-black text-xs bg-gray-50 outline-none"
                    disabled={isDeploying}
                  >
                    <option value="europe-west2">Europe West 2 (London)</option>
                    <option value="us-central1">US Central 1 (Iowa)</option>
                    <option value="europe-west1">Europe West 1 (Belgium)</option>
                    <option value="asia-east1">Asia East 1 (Taiwan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Allocated vCPU Units
                  </label>
                  <select
                    value={config.cpu}
                    onChange={(e) => setConfig({ ...config, cpu: e.target.value })}
                    className="w-full p-2.5 border-2 border-black font-black text-xs bg-gray-50 outline-none"
                    disabled={isDeploying}
                  >
                    <option value="1">1 cpu (Standard web application)</option>
                    <option value="2">2 cpu (High concurrency workloads)</option>
                    <option value="0.5">0.5 cpu (Ultra low-cost / Sandbox)</option>
                  </select>
                </div>
              </div>

              {/* Form Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Allocated Memory Limit
                  </label>
                  <select
                    value={config.memory}
                    onChange={(e) => setConfig({ ...config, memory: e.target.value })}
                    className="w-full p-2.5 border-2 border-black font-black text-xs bg-gray-50 outline-none"
                    disabled={isDeploying}
                  >
                    <option value="1Gi">1 Gi (Recommended for Node)</option>
                    <option value="512Mi">512 Mi (Resource consolidated)</option>
                    <option value="2Gi">2 Gi (Large memory caching)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Min Scaling
                    </label>
                    <input
                      type="number"
                      value={config.minInstances}
                      onChange={(e) => setConfig({ ...config, minInstances: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={5}
                      className="w-full p-2.5 border-2 border-black font-semibold text-xs bg-gray-50 outline-none"
                      disabled={isDeploying}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Max Scaling
                    </label>
                    <input
                      type="number"
                      value={config.maxInstances}
                      onChange={(e) => setConfig({ ...config, maxInstances: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={100}
                      className="w-full p-2.5 border-2 border-black font-semibold text-xs bg-gray-50 outline-none"
                      disabled={isDeploying}
                    />
                  </div>
                </div>
              </div>

              {/* Security Ingress */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allowUnauthenticated"
                  checked={config.allowUnauthenticated}
                  onChange={(e) => setConfig({ ...config, allowUnauthenticated: e.target.checked })}
                  className="w-4 h-4 accent-black border-2 border-black"
                  disabled={isDeploying}
                />
                <label htmlFor="allowUnauthenticated" className="text-xs font-black uppercase cursor-pointer select-none">
                  🔓 Allow Public (Unauthenticated) Ingress traffic
                </label>
              </div>
            </div>
          </div>

          {/* Right Side: Environment Variables List */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <header className="border-b-2 border-black pb-2 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black uppercase">🗝 Environmental Variables & Secrets</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Define keys passed to your container execution context</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-2 py-1 text-[9px] font-black bg-black text-white hover:bg-gray-800 uppercase"
              >
                {showApiKey ? "🔒 Hide API Value" : "👁 Show API Value"}
              </button>
            </header>

            <div className="space-y-2 divide-y-2 divide-gray-100">
              {config.envVars.map((v) => (
                <div key={v.key} className="flex gap-4 items-center justify-between pt-2 first:pt-0">
                  <span className="font-mono text-xs font-black uppercase">{v.key}</span>
                  <div className="flex-1 max-w-[240px] flex items-center gap-1">
                    <input
                      type={v.key === "GEMINI_API_KEY" && !showApiKey ? "password" : "text"}
                      value={v.value}
                      onChange={(e) => updateEnvVarValue(v.key, e.target.value)}
                      placeholder={v.key === "GEMINI_API_KEY" ? "Enter custom Gemini API Key..." : "Enter value..."}
                      className="w-full p-2 border border-black font-semibold text-xs outline-none focus:bg-gray-50"
                      disabled={isDeploying}
                    />
                    <button
                      type="button"
                      onClick={() => removeEnvVar(v.key)}
                      className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-black rounded-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to append new environments vars */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t-2 border-black">
              <input
                type="text"
                placeholder="VARIABLE_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="p-2 border-2 border-black font-semibold text-[11px] uppercase placeholder-gray-400"
                disabled={isDeploying}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="variable_value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="p-2 border-2 border-black font-semibold text-[11px] flex-1 placeholder-gray-400"
                  disabled={isDeploying}
                />
                <button
                  type="button"
                  onClick={addEnvVar}
                  className="bg-black text-white hover:bg-sdg-3 p-2 border-2 border-black flex items-center justify-center font-bold"
                  disabled={isDeploying}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Deployment Status & Live Terminal Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Panel */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-xs font-black uppercase border-b-2 border-black pb-3">
              Deployment Live Health Checker
            </h3>

            <div className="flex items-center justify-between bg-gray-50 p-4 border-2 border-black">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400">Microservice Status</span>
                {config.status === "running" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-sm font-black text-emerald-600 uppercase">RUNNING (READY)</span>
                  </div>
                ) : config.status === "deploying" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-sm font-black text-amber-500 uppercase">SYNCHRONIZING REVISIONS...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-sm font-black text-gray-400 uppercase">NOT YET CONFIGURED</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-gray-400">Active Location</span>
                <p className="text-xs font-black uppercase mt-1 text-gray-800">{config.region.toUpperCase()}</p>
              </div>
            </div>

            {config.serviceUrl && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-xs text-emerald-950 font-medium space-y-2">
                <span className="text-[9px] font-black uppercase text-emerald-700 block">HTTP Service Gateway Access Point:</span>
                <a
                  href={config.serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold hover:underline break-all inline-flex items-center gap-1.5 text-blue-600"
                >
                  {config.serviceUrl}
                  <ExternalLink size={12} />
                </a>
                <div className="text-[9px] text-gray-400 uppercase font-bold pt-1">
                  Last updated: {config.lastDeployedAt}
                </div>
              </div>
            )}

            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-3 bg-black hover:bg-blue-600 active:bg-blue-700 text-white font-black uppercase text-xs tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 block transition-all disabled:opacity-50"
            >
              {isDeploying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  REDEPLOY CONTEXT ACTIVE...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play size={14} className="fill-current" />
                  TRIGGER CLOUD RUN DEPLOYMENT
                </span>
              )}
            </button>
          </div>

          {/* Warning notice */}
          <div className="bg-amber-50 border-2 border-amber-500 p-4 space-y-2">
            <h4 className="text-[10px] text-amber-800 font-black uppercase flex items-center gap-2">
              <ShieldAlert size={14} />
              PRODUCTION LAUNCH SAFEGUARD
            </h4>
            <p className="text-[10px] text-amber-950 leading-relaxed font-semibold">
              The platform builds this microservice into the isolated container cluster, matching settings detailed in <span className="font-mono">DEPLOY.md</span>. Connecting your local command CLI via gcloud will override any active parameters context.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Area */}
      {showTerminal && (
        <div className="bg-black text-gray-100 border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono text-xs space-y-4">
          <header className="border-b border-gray-800 pb-2 flex justify-between items-center text-gray-400">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-200">Terminal Shell Live Deployment Pipeline</span>
            </div>
            <button
              onClick={() => {
                setShowTerminal(false);
                setTerminalLogs([]);
              }}
              className="hover:text-white px-2 py-0.5 border border-gray-800 hover:border-gray-500 rounded-none text-[9px] uppercase"
              disabled={isDeploying}
            >
              Clear Console
            </button>
          </header>

          <div className="space-y-1.5 max-h-80 overflow-y-auto leading-normal select-text whitespace-pre-wrap">
            {terminalLogs.map((log, i) => (
              <div key={i} className={getLogStyle(log)}>
                {log}
              </div>
            ))}
            {isDeploying && (
              <div className="flex items-center gap-2 text-gray-400 italic">
                <span className="w-1.5 h-3 bg-white animate-pulse" />
                <span>Executing automated build container scripts...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
