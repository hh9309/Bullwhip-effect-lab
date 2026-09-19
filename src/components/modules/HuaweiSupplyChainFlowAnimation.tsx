/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Cpu, 
  Truck, 
  Store, 
  UserCheck, 
  Factory, 
  ArrowRight, 
  ArrowLeft,
  Activity, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Database, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  Smartphone,
  Gauge,
  Info,
  Disc
} from "lucide-react";

/**
 * 300mm 先进制程芯片硅晶圆 Logo (Silicon Wafer Logo)
 * 具备标志性平边缺口 (Wafer Notch)、光刻 Die 阵列网格与金属彩虹衍射高光
 */
export const SiliconWaferLogo: React.FC<{
  size?: number;
  className?: string;
  showGlow?: boolean;
  spinning?: boolean;
}> = ({ size = 26, className = "", showGlow = true, spinning = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="300mm 先进制程半导体硅晶圆 (Silicon Wafer)"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-[0_2px_8px_rgba(56,189,248,0.45)] ${
          spinning ? "animate-[spin_8s_linear_infinite]" : ""
        }`}
      >
        <defs>
          {/* 晶圆虹彩金属与光刻衍射渐变 */}
          <radialGradient id="waferIridescentGrad" cx="38%" cy="35%" r="62%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="28%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="88%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>
          <linearGradient id="waferSheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#c084fc" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
          </linearGradient>
          {/* 芯片 Die 切割微网格 */}
          <pattern id="waferDiePattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#e0f2fe" strokeWidth="0.5" strokeOpacity="0.45" />
          </pattern>
        </defs>

        {/* 晶圆基板圆盘 */}
        <circle cx="24" cy="24" r="21" fill="url(#waferIridescentGrad)" stroke="#7dd3fc" strokeWidth="1.5" />

        {/* 光刻芯片微阵列 (Die Matrix) */}
        <circle cx="24" cy="24" r="19" fill="url(#waferDiePattern)" />

        {/* 衍射同心测试环 (Concentric Metrology Rings) */}
        <circle cx="24" cy="24" r="14" stroke="#e0f2fe" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.75" />
        <circle cx="24" cy="24" r="8" stroke="#ffffff" strokeWidth="0.9" strokeDasharray="2 1.5" opacity="0.85" />
        
        {/* 中心麒麟测试裸晶 (Center Golden Die) */}
        <rect x="21" y="21" width="6" height="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.8" />

        {/* 晶圆定位缺口 (Wafer Notch at bottom) */}
        <path d="M 22.5 45 L 24 42.5 L 25.5 45 Z" fill="#075985" stroke="#38bdf8" strokeWidth="0.5" />

        {/* 表面彩虹反射高光条 (Laser Sheen Beam) */}
        <path
          d="M 9 17 C 17 9 31 9 39 17"
          stroke="url(#waferSheenGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
      {showGlow && (
        <span className="absolute -inset-1 rounded-full bg-sky-400/30 blur-xs pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};

/**
 * 华为高端旗舰智能手机 Logo (Huawei Smartphone Logo)
 * 具备标志性星环 XMAGE 光学镜头圆环、曲面微晶中框与 HarmonyOS 屏幕光效
 */
export const HuaweiSmartphoneLogo: React.FC<{
  size?: number;
  className?: string;
  showGlow?: boolean;
}> = ({ size = 20, className = "", showGlow = true }) => {
  const width = size;
  const height = Math.round(size * 1.8);
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width, height }}
      title="华为鸿蒙旗舰智能手机 (Huawei Flagship Smartphone)"
    >
      <svg
        viewBox="0 0 28 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]"
      >
        <defs>
          <linearGradient id="huaweiPhoneBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="45%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient id="huaweiBezelGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <radialGradient id="huaweiXmageRing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#44403c" />
            <stop offset="55%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
        </defs>

        {/* 手机超韧外壳 (玄武架构微弧中框) */}
        <rect
          x="1"
          y="1"
          width="26"
          height="46"
          rx="5"
          fill="url(#huaweiPhoneBodyGrad)"
          stroke="#ef4444"
          strokeWidth="1.3"
        />

        {/* 顶部听筒微缝 */}
        <line x1="10" y1="3" x2="18" y2="3" stroke="#a8a29e" strokeWidth="0.8" strokeLinecap="round" />

        {/* 标志性华为「星环」XMAGE 光学超光变镜头模组 */}
        <circle cx="14" cy="16" r="7.5" fill="url(#huaweiXmageRing)" stroke="#ef4444" strokeWidth="1" />
        <circle cx="14" cy="16" r="5" fill="#1c1917" stroke="#78716c" strokeWidth="0.5" strokeDasharray="1.5 1" />
        
        {/* 三摄镜片光圈 (XMAGE Camera Lenses) */}
        <circle cx="14" cy="12" r="1.3" fill="#38bdf8" />
        <circle cx="10.5" cy="16" r="1.3" fill="#38bdf8" />
        <circle cx="17.5" cy="16" r="1.3" fill="#38bdf8" />
        {/* XMAGE 金色铭牌 */}
        <rect x="12" y="15" width="4" height="2" rx="0.5" fill="#f59e0b" opacity="0.95" />

        {/* 手机机身背板分色纹理 (昆仑微晶玻璃饰线) */}
        <rect x="4.5" y="27" width="19" height="15" rx="2" fill="#18181b" opacity="0.75" />
        <line x1="7" y1="31" x2="21" y2="31" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" opacity="0.75" />
        <line x1="9" y1="35" x2="19" y2="35" stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        <circle cx="14" cy="38.5" r="1" fill="#e2e8f0" opacity="0.6" />

        {/* 底部 Type-C 与对称扬声孔 */}
        <line x1="12" y1="46" x2="16" y2="46" stroke="#d6d3d1" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
      {showGlow && (
        <span className="absolute -inset-1 rounded-lg bg-red-500/30 blur-xs pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};

export type SupplyChainMode = "huawei-isc" | "traditional-push";

interface StageDetail {
  id: string;
  stepNum: number;
  name: string;
  subName: string;
  location: string;
  role: string;
  equipment: string[];
  bomParts: string[];
  huaweiPractices: string[];
  bullwhipCountermeasure: string;
  leadTime: string;
  varianceAmplification: string;
}

const STAGES: StageDetail[] = [
  {
    id: "parts",
    stepNum: 1,
    name: "核心零部件供应链",
    subName: "Tier-1 / Tier-2 高精元器件集群",
    location: "深圳/上海/成都 芯片设计与先进制程封装基地",
    role: "供应麒麟 SoC、5G 射频天线、京东方 LTPO OLED 屏幕、超聚光 XMAGE 镜头模组、昆仑玻璃微晶面板及高能量密度电池。",
    equipment: [
      "微米级晶圆精密光刻与倒装封装设备",
      "真空无尘 OLED 蒸镀与激光切割机",
      "高精密光学镜片自动化对焦校准治具",
      "全自动化精密结构件 CNC 切削中心"
    ],
    bomParts: [
      "先进制程 麒麟 SoC 处理器模组",
      "京东方/维信诺 2K 双曲护眼 OLED 面板",
      "超聚光潜望式超光变 XMAGE 摄像头",
      "二代纳米微晶昆仑耐摔玻璃外壳",
      "硅碳负极青海湖 5500mAh 电池"
    ],
    huaweiPractices: [
      "推行战略级 VMI (供应商管理库存) 共享协同仓",
      "核心元器件建立二级深溯源数字供应链看板",
      "与战略供应商签订产能保底与共同技术研发协议"
    ],
    bullwhipCountermeasure: "通过消除中介批发商层层加码采购，供应商直接接入华为实时物料看板，按天平滑消耗供给，彻底杜绝虚报订货。",
    leadTime: "10 ~ 15 天 (传统模式需 60~90 天)",
    varianceAmplification: "1.12x (传统模式为 3.8x ~ 5.2x)"
  },
  {
    id: "assembly",
    stepNum: 2,
    name: "智能精密总装制造",
    subName: "东莞松山湖智能终端生产基地",
    location: "广东东莞 松山湖华为智能终端制造基地 (Smart Factory)",
    role: "采用行业前沿的自动化装配产线，完成 SMT 高速表面贴装、精密点胶、六轴机械臂组装、全自动激光标定、整机包装出厂。",
    equipment: [
      "FUJI 高速多功能表面贴片机 (SMT)",
      "KUKA/Fanuc 六轴高灵敏度柔性装配机械臂",
      "全自动 IP68 深度气密性激光测试治具",
      "XMAGE 独立无尘微米光学暗室标定平台",
      "HarmonyOS NEXT 鸿蒙系统全自动并行烧录台"
    ],
    bomParts: [
      "主板 PCBA 核心运算单元",
      "整机玄武架构超韧中框",
      "高导热液冷均热板 (VC 均温板)",
      "立体双扬声器与振动线性马达",
      "精品磁吸烫金旗舰包装盒与氮化镓快充"
    ],
    huaweiPractices: [
      "柔性混流生产线，单线支持多配置多颜色秒级换产",
      "工业数字孪生与全程 MES 制造执行系统秒级闭环",
      "严格的 IPD (集成产品开发) 与可制造性设计 (DFM)"
    ],
    bullwhipCountermeasure: "采用 JIT (准时制) 订单拉动排产，不为假想需求盲目堆积在制品，整机组装周期压缩至极致。",
    leadTime: "2 ~ 3 天 (下线即发运)",
    varianceAmplification: "1.08x (传统模式为 2.8x)"
  },
  {
    id: "logistics",
    stepNum: 3,
    name: "智慧仓储与干线物流",
    subName: "ISC+ 智能调度总仓与极速分拨网络",
    location: "全国各大区域 RDC 中央物流枢纽与顺丰航空机队",
    role: "运用潜伏式 AGV 移动搬运机器人、自动化立体穿梭高架仓 (AS/RS) 与北斗高精定位新能源物流干线，实现全国核心城市 24 小时直达。",
    equipment: [
      "潜伏顶升式二维码视觉导航 AGV 搬运机群",
      "24米超高密度立体智能存取穿梭仓 (AS/RS)",
      "动态 RFID 高速整托盘批量出入库感应门",
      "顺丰航空波音 747/767 华为专机货运航线",
      "全温控恒湿抗震新能源绿色物流重卡"
    ],
    bomParts: [
      "标准抗震高强度物流转运周转箱",
      "内置物联网定位与温湿度传感智能标签",
      "整箱防伪溯源防撕封箱扎带"
    ],
    huaweiPractices: [
      "实行全流程‘货到人’自动化极速拣选调配",
      "ISC 数字控制塔 (Control Tower) 实时在途动态路线优化",
      "区域中心仓越库直发 (Cross-docking) 减少二次搬运"
    ],
    bullwhipCountermeasure: "全网动态调配算法根据各地实际销售速率动态分流，杜绝传统分销商各自为政的死板配额滞销囤货。",
    leadTime: "12 ~ 24 小时区域直达",
    varianceAmplification: "1.05x (传统模式为 2.1x)"
  },
  {
    id: "retail",
    stepNum: 4,
    name: "全渠道体验店与零售",
    subName: "华为智能生活馆 / 授权体验店 / Vmall",
    location: "全国 5000+ 华为智能生活馆、授权体验店及线上官方商城",
    role: "通过数字化真机展台、沉浸式全场景互联体验与智能云 POS，为消费者提供真机体验与即买即提的高端旗舰服务。",
    equipment: [
      "防盗充电一体化智能交互展示体验台",
      "云化数字化 POS 扫码收银结算终端",
      "门店微型智能储物抽屉与自助提货柜",
      "全场景智慧生活 IoT 协同演示体验区"
    ],
    bomParts: [
      "旗舰真机展示样机与防窥体验膜",
      "定制精品手提袋与 VIP 会员权益卡",
      "现场全景试拍光学评测色卡道具"
    ],
    huaweiPractices: [
      "全面统一价格与促销政策，消除渠道黄牛前瞻囤积空间",
      "门店库存完全在线化，支持‘网订店取’与‘店发同城’",
      "基于店圈常住客群画像的精准微配额智能补货"
    ],
    bullwhipCountermeasure: "完全杜绝以批零差价为诱饵的阶梯批量压货，由总部系统按日小批量循环补货，货架周转天数降低 65%。",
    leadTime: "实时现货 (缺货时极速同城调拨 2小时)",
    varianceAmplification: "1.02x (传统模式为 1.8x)"
  },
  {
    id: "consumer",
    stepNum: 5,
    name: "终端消费者与反向数据流",
    subName: "激活消费与 POS 秒级拉动闭环",
    location: "终端消费者手中 & 华为全球供应链云数据中心",
    role: "消费者选购完成并开机激活，收银台与激活系统触发数据脉冲，秒级逆流反哺至生产与供应链中枢，形成自适应拉动式神经闭环！",
    equipment: [
      "无线智能激光条形码/SN 码扫描枪",
      "华为全网零售流水大数据实时湖仓",
      "供应链 ISC+ 智能补货自动化决策引擎",
      "终端自动联网激活设备心跳握手网关"
    ],
    bomParts: [
      "消费者购机发票与电子三包凭证",
      "专属华为账号与云空间激活协议"
    ],
    huaweiPractices: [
      "Sell-through (实际实销数据) 替代 Sell-in (向渠道压货数据)",
      "开机激活即时统计，10分钟内生成全国热力销售图谱",
      "全链路数字孪生，自动将补货需求拆解为晶圆与装配指令"
    ],
    bullwhipCountermeasure: "【牛鞭效应的终极破局者】需求信息不再经过层层人脑猜测和放大，而是直接由终端消费者的扫码动作无损穿透至源头！",
    leadTime: "0 延迟反哺 (秒级数据回传)",
    varianceAmplification: "1.00x (基准无失真)"
  }
];

export const HuaweiSupplyChainFlowAnimation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activeStageId, setActiveStageId] = useState<string>("assembly");
  const [mode, setMode] = useState<SupplyChainMode>("huawei-isc");

  // 动态仿真累计计步与物理流计数器
  const [tick, setTick] = useState<number>(0);
  const [partsCount, setPartsCount] = useState<number>(12480);
  const [assembledCount, setAssembledCount] = useState<number>(9820);
  const [transitCount, setTransitCount] = useState<number>(840);
  const [storeStockCount, setStoreStockCount] = useState<number>(1560);
  const [activatedCount, setActivatedCount] = useState<number>(8260);

  // 反向信息流脉冲闪烁状态
  const [dataPulseActive, setDataPulseActive] = useState<boolean>(false);
  const [latestEvent, setLatestEvent] = useState<string>("华为松山湖总装线：HarmonyOS NEXT 自动化烧录完成，下线 1 台");

  // 动画计时器驱动
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 360);

      // 定期累加产量模拟真实流动
      if (Math.random() > 0.4) {
        setPartsCount((p) => p + 3);
        setAssembledCount((a) => a + 2);
        setActivatedCount((c) => c + 2);
        
        // 触发一次反向脉冲与提示
        if (Math.random() > 0.6) {
          setDataPulseActive(true);
          setTimeout(() => setDataPulseActive(false), 900);

          const events = [
            "北京王府井旗舰店：完成 1 台 Mate 旗舰机扫码激活，触发 POS 实时冲减",
            "松山湖制造基地：第 42 自动化产线六轴机械臂完成精密贴合，合格率 99.8%",
            "顺丰航空专机：深蓉干线冷链高精密调拨在途，预计 45 分钟抵作成都 RDC",
            "成都 VMI 前置仓：检测到京东方 OLED 面板消耗达安全阈值，触发自动补仓指令",
            "华为商城 Vmall：华东用户下单完成，系统就近指派上海智能生活馆极速发货"
          ];
          setLatestEvent(events[Math.floor(Math.random() * events.length)]);
        }
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[1];

  const handleReset = () => {
    setTick(0);
    setPartsCount(12000);
    setAssembledCount(9500);
    setTransitCount(800);
    setStoreStockCount(1500);
    setActivatedCount(8000);
    setLatestEvent("系统仿真已重置为初始运行稳态");
  };

  return (
    <div id="huawei-supply-chain-animation-root" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* 顶部标题与导读 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-red-700 text-white flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> 华为高端旗舰终端
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Integrated Supply Chain (ISC+) Full Physical & Digital Flow
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>华为手机供应链实体运作仿真：从零件、组装到销售全流程</span>
            <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-sans font-medium">
              双向流动态交互
            </span>
          </h3>
          <p className="text-sm text-stone-600 mt-1 max-w-4xl leading-relaxed">
            直观展现实体物资流（<strong className="text-stone-800">上游元器件 ➔ 松山湖精密总装 ➔ 智慧物流仓储 ➔ 授权生活馆 ➔ 消费者购买</strong>）与反向数字化信息流（<strong className="text-teal-800 font-medium">POS 秒级扫码 ➔ 需求秒级反哺 ➔ 芯片与总装按需拉动</strong>）的双向咬合机制。
          </p>
        </div>

        {/* 控制器工具条 */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* 运行模式切换按钮 */}
          <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-stone-200 text-xs font-medium">
            <button
              onClick={() => setMode("huawei-isc")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "huawei-isc"
                  ? "bg-white text-stone-900 font-semibold shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              华为 ISC+ 敏捷拉动模式
            </button>
            <button
              onClick={() => setMode("traditional-push")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "traditional-push"
                  ? "bg-amber-600 text-white font-semibold shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              传统多层盲目推式模式
            </button>
          </div>

          {/* 播放/暂停 */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-2xs transition-all cursor-pointer"
            title={isPlaying ? "暂停动画" : "播放动画"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "暂停" : "继续"}</span>
          </button>

          {/* 倍速切换 */}
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden text-xs bg-white">
            {[0.5, 1, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => setSpeed(sp)}
                className={`px-2.5 py-2 font-mono transition-colors cursor-pointer ${
                  speed === sp
                    ? "bg-stone-200 text-stone-900 font-bold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* 重置 */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition-all cursor-pointer"
            title="重置仿真"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 实时遥测指标 HUD 仪表条 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <Cpu className="w-3 h-3 text-stone-700" />
            <span>核心零部件产出</span>
          </div>
          <div className="text-lg font-mono font-bold text-stone-900 mt-1">
            {partsCount.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">件</span>
          </div>
          <div className="text-[10px] text-teal-700 mt-0.5">VMI 动态调拔</div>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <Factory className="w-3 h-3 text-amber-700" />
            <span>松山湖装配下线</span>
          </div>
          <div className="text-lg font-mono font-bold text-stone-900 mt-1">
            {assembledCount.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">台</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">良品率 99.82%</div>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <Truck className="w-3 h-3 text-sky-700" />
            <span>干线在途货物</span>
          </div>
          <div className="text-lg font-mono font-bold text-stone-900 mt-1">
            {transitCount.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">箱</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">北斗实时定位监控</div>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <Store className="w-3 h-3 text-indigo-700" />
            <span>全国生活馆现货</span>
          </div>
          <div className="text-lg font-mono font-bold text-stone-900 mt-1">
            {storeStockCount.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">台</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">现货满足率 98.6%</div>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-teal-700" />
            <span>终端开机激活</span>
          </div>
          <div className="text-lg font-mono font-bold text-teal-800 mt-1">
            {activatedCount.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">人</span>
          </div>
          <div className="text-[10px] text-teal-700 font-mono mt-0.5">+秒级 POS 回传</div>
        </div>

        <div className={`p-3 rounded-xl border transition-colors ${
          mode === "huawei-isc" ? "bg-teal-50/70 border-teal-200" : "bg-red-50/70 border-red-200"
        }`}>
          <div className="text-[11px] font-medium flex items-center justify-between">
            <span className={mode === "huawei-isc" ? "text-teal-900" : "text-red-900"}>
              {mode === "huawei-isc" ? "ISC 敏捷协同" : "牛鞭效应失真"}
            </span>
            <Gauge className={`w-3 h-3 ${mode === "huawei-isc" ? "text-teal-700" : "text-red-700"}`} />
          </div>
          <div className={`text-lg font-mono font-bold mt-1 ${mode === "huawei-isc" ? "text-teal-900" : "text-red-900"}`}>
            {mode === "huawei-isc" ? "1.06x" : "4.82x"}
          </div>
          <div className={`text-[10px] mt-0.5 ${mode === "huawei-isc" ? "text-teal-700" : "text-red-700"}`}>
            {mode === "huawei-isc" ? "周转21天 · 近零畸变" : "时滞60天 · 严重爆仓"}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 核心实体物理运作动画画布 (Physical Supply Chain Vector Canvas) */}
      {/* ===================================================================== */}
      <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 sm:p-6 overflow-hidden shadow-inner text-white select-none">
        {/* 背景轻量微网格与装饰光晕 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-900/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-teal-900/15 blur-3xl pointer-events-none" />

        {/* 顶部运作状态与实时流水滚屏条 */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-stone-300 font-sans font-medium">华为全链路数字孪生中枢监控中</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400">运行节拍: T+{tick.toString().padStart(3, "0")}s</span>
          </div>

          <div className="flex items-center gap-2 truncate text-[11px] text-stone-300 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 max-w-xl">
            <Radio className="w-3 h-3 text-red-400 shrink-0 animate-pulse" />
            <span className="truncate">{latestEvent}</span>
          </div>
        </div>

        {/* 5 大物理站点全景布局 (Stage Cards & Visual Entities) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map((stage, idx) => {
            const isSelected = activeStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`group relative text-left rounded-xl p-3 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-stone-800/90 border-red-500/80 shadow-lg ring-1 ring-red-500/30"
                    : "bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50"
                }`}
              >
                {/* 标号与状态指示 */}
                <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isSelected ? "bg-red-600 text-white" : "bg-stone-800 text-stone-400"
                  }`}>
                    0{stage.stepNum} 环节
                  </span>
                  <span className="text-[10px] text-stone-500">{stage.leadTime}</span>
                </div>

                <div className="font-semibold text-xs sm:text-sm text-stone-100 group-hover:text-white flex items-center justify-between">
                  <span>{stage.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                </div>

                <div className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                  {stage.subName}
                </div>

                {/* 当前环节方差指标指示 */}
                <div className="mt-2.5 pt-2 border-t border-stone-800/70 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-stone-500">实测放大:</span>
                  <span className={`font-bold ${
                    mode === "huawei-isc" ? "text-teal-400" : "text-amber-400"
                  }`}>
                    {mode === "huawei-isc" ? stage.varianceAmplification.split(" ")[0] : "3.0x+"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ===================================================================== */}
        {/* 动态实体运转管道与动画图形示意图 (The Physical Machine & Conveyor Canvas) */}
        {/* ===================================================================== */}
        <div className="relative z-10 mt-6 pt-2 pb-4">
          <div className="rounded-xl bg-stone-950/80 border border-stone-800/80 p-4 relative overflow-hidden">
            {/* 上部：实体物资流流水线 (Physical Materials Flow - 从左往右) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2 font-mono">
                <span className="flex items-center gap-1.5 text-stone-300 font-sans font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  实体物理流：零配件制造 ➔ 松山湖总装 ➔ 智能储运 ➔ 门店销售 ➔ 消费者
                </span>
                <span className="text-stone-500 flex items-center gap-1">
                  流速: {speed}x <ArrowRight className="w-3 h-3 text-blue-400" />
                </span>
              </div>

              {/* 实体物理流双形态强化导览条 (晶圆 Logo 与 手机 Logo 形态转换透视) */}
              <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-sky-950/70 via-stone-900 to-red-950/70 border border-stone-800 text-xs flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-950/90 border border-sky-400/60 text-sky-200 shadow-sm">
                    <SiliconWaferLogo size={22} showGlow={true} spinning={isPlaying} />
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-sky-200 leading-tight">从晶圆厂出库</span>
                      <span className="text-[9px] text-sky-400/90 font-mono">300mm 硅晶圆物理流</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline text-stone-400">松山湖 SMT 贴装 / 鸿蒙烧录</span>
                    <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-950/90 border border-red-500/60 text-red-200 shadow-sm">
                    <HuaweiSmartphoneLogo size={15} showGlow={true} />
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-red-200 leading-tight">从松山湖出厂</span>
                      <span className="text-[9px] text-red-400/90 font-mono">鸿蒙旗舰手机物理流</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    晶圆吞吐: <strong className="text-sky-300 font-bold">{partsCount.toLocaleString()} 片</strong>
                  </span>
                  <span className="text-stone-700">|</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    整机下线: <strong className="text-red-300 font-bold">{assembledCount.toLocaleString()} 台</strong>
                  </span>
                </div>
              </div>

              {/* 物理传送带与设备实体 SVG 动态仿真 */}
              <div className="relative w-full h-52 sm:h-60 bg-gradient-to-b from-stone-900/95 via-stone-950 to-stone-900/95 rounded-xl border border-stone-800 overflow-hidden flex items-center justify-between px-2 sm:px-4">
                
                {/* 1. 零部件工作站：硅晶圆加工 & 芯片出料 */}
                <div 
                  onClick={() => setActiveStageId("parts")}
                  className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                    activeStageId === "parts" ? "scale-105" : "hover:scale-102"
                  }`}
                  title="点击解剖核心芯片晶圆供应链"
                >
                  <div className="w-18 h-26 sm:w-22 sm:h-30 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-sky-500/50 flex flex-col items-center justify-center relative p-2 shadow-lg group-hover:border-sky-400">
                    {/* 晶圆指示微徽标 */}
                    <div className="w-10 h-10 rounded-lg bg-sky-950/90 border border-sky-400/60 flex items-center justify-center relative shadow-inner mb-1">
                      <SiliconWaferLogo size={32} spinning={isPlaying} showGlow={true} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    </div>
                    <span className="text-[10px] font-mono text-sky-200 font-bold text-center leading-tight">Kirin 9000</span>
                    <span className="text-[9px] text-sky-400/90 font-medium">晶圆制造厂</span>
                    
                    {/* 晶圆产出形态标签 */}
                    <div className="mt-1 px-1 py-0.5 rounded bg-sky-900/60 border border-sky-400/50 text-[8px] font-mono text-sky-200 font-bold flex items-center gap-0.5">
                      <Disc className="w-2.5 h-2.5 text-sky-300" />
                      <span>300mm晶圆</span>
                    </div>

                    {/* 芯片出料脉冲 */}
                    <div className="absolute -bottom-2 w-3 h-3 rounded-full bg-sky-400 animate-ping opacity-75" />
                  </div>
                  <span className="text-[10px] text-sky-300 mt-1.5 font-medium flex items-center gap-1">
                    <span>① 晶圆输出</span>
                  </span>
                </div>

                {/* 传送带 1：从晶圆厂出来的晶圆物理流 (以晶圆 Logo 动态呈现) */}
                <div className="flex-1 h-11 sm:h-12 bg-stone-950 rounded-lg mx-1 sm:mx-2 relative overflow-hidden border border-sky-900/60 flex items-center shadow-inner">
                  {/* 传送带导轨条纹与微动画 */}
                  <div 
                    className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#0284c7,#0284c7_8px,transparent_8px,transparent_20px)] opacity-35"
                    style={{
                      transform: isPlaying ? `translateX(${((tick * speed * 3) % 40)}px)` : "none",
                      transition: "none"
                    }}
                  />
                  
                  {/* 传送带轨道微标线 */}
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-sky-500/30" />
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-sky-500/30" />

                  {/* 在途晶圆 1 (从晶圆厂出来的晶圆 Logo) */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${(tick * speed * 4) % 100}%`
                    }}
                  >
                    <SiliconWaferLogo size={24} spinning={isPlaying} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-sky-950/90 border border-sky-400/80 text-sky-200 shadow-xs whitespace-nowrap">
                      晶圆
                    </span>
                  </div>

                  {/* 在途晶圆 2 (交错相位) */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((tick * speed * 4) + 52) % 100}%`
                    }}
                  >
                    <SiliconWaferLogo size={24} spinning={isPlaying} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-sky-950/90 border border-sky-400/80 text-sky-200 shadow-xs whitespace-nowrap">
                      晶圆
                    </span>
                  </div>
                </div>

                {/* 2. 松山湖总装厂：SMT 贴片、六轴机械手装配、晶圆向手机的实体质变枢纽 */}
                <div 
                  onClick={() => setActiveStageId("assembly")}
                  className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                    activeStageId === "assembly" ? "scale-105" : "hover:scale-102"
                  }`}
                  title="点击解剖松山湖终端精密总装"
                >
                  <div className="w-22 h-28 sm:w-26 sm:h-32 rounded-xl bg-gradient-to-b from-red-950/50 via-stone-800 to-stone-900 border border-red-500/50 flex flex-col items-center justify-center relative p-2 shadow-xl group-hover:border-red-400">
                    {/* 激光扫描检测光束 */}
                    <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    
                    {/* 晶圆输入 ➔ 手机输出 微动态对比 */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-7 h-7 rounded bg-stone-900 border border-sky-500/50 flex items-center justify-center shadow-xs" title="300mm 晶圆入库">
                        <SiliconWaferLogo size={18} showGlow={false} />
                      </div>
                      <ArrowRight className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                      <div className="w-7 h-8 rounded bg-stone-900 border border-red-500/60 flex items-center justify-center shadow-xs" title="智能手机总装下线">
                        <HuaweiSmartphoneLogo size={14} showGlow={false} />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-red-200 font-bold text-center leading-tight">松山湖 SMT</span>
                    <span className="text-[9px] text-stone-300">六轴柔性总装</span>
                    
                    {/* 质检 Pass 标牌 */}
                    <div className="mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[8px] font-mono text-emerald-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>手机下线 Pass</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-red-300 mt-1.5 font-medium flex items-center gap-1">
                    <span>② 松山湖总装</span>
                  </span>
                </div>

                {/* 传送带 2：从松山湖出来的手机物理流 ➔ 前往 RDC 物流 (以手机 Logo 动态呈现) */}
                <div className="flex-1 h-11 sm:h-12 bg-stone-950 rounded-lg mx-1 sm:mx-2 relative overflow-hidden border border-red-900/60 flex items-center shadow-inner">
                  <div 
                    className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#ef4444,#ef4444_8px,transparent_8px,transparent_20px)] opacity-35"
                    style={{
                      transform: isPlaying ? `translateX(${((tick * speed * 3) % 40)}px)` : "none",
                      transition: "none"
                    }}
                  />
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-red-500/30" />
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-red-500/30" />

                  {/* 从松山湖出来的手机 1 (以华为手机 Logo 呈现) */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((tick * speed * 4) + 15) % 100}%`
                    }}
                  >
                    <HuaweiSmartphoneLogo size={18} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-red-950/90 border border-red-500/80 text-red-200 shadow-xs whitespace-nowrap">
                      Mate手机
                    </span>
                  </div>

                  {/* 从松山湖出来的手机 2 */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((tick * speed * 4) + 65) % 100}%`
                    }}
                  >
                    <HuaweiSmartphoneLogo size={18} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-red-950/90 border border-red-500/80 text-red-200 shadow-xs whitespace-nowrap">
                      Mate手机
                    </span>
                  </div>
                </div>

                {/* 3. 智能物流与立体高架总仓：AGV 搬运 & 手机整箱发运 */}
                <div 
                  onClick={() => setActiveStageId("logistics")}
                  className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                    activeStageId === "logistics" ? "scale-105" : "hover:scale-102"
                  }`}
                  title="点击解剖干线物流与 RDC 仓储"
                >
                  <div className="w-18 h-26 sm:w-22 sm:h-30 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-amber-500/50 flex flex-col items-center justify-center relative p-2 shadow-lg group-hover:border-amber-400">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-1 shadow-inner relative">
                      <Truck className="w-5 h-5" />
                      <div className="absolute -bottom-1 -right-1">
                        <HuaweiSmartphoneLogo size={11} showGlow={false} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-200 font-bold">RDC 枢纽</span>
                    <span className="text-[9px] text-stone-300">顺丰专机/AGV</span>

                    <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-[8px] text-amber-300 font-mono font-bold">
                      手机整托调拨
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-300 mt-1.5 font-medium">③ 智慧物流</span>
                </div>

                {/* 传送带 3：从松山湖出来的手机继续流向门店零售 */}
                <div className="flex-1 h-11 sm:h-12 bg-stone-950 rounded-lg mx-1 sm:mx-2 relative overflow-hidden border border-amber-900/60 flex items-center shadow-inner">
                  <div 
                    className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#f59e0b,#f59e0b_8px,transparent_8px,transparent_20px)] opacity-35"
                    style={{
                      transform: isPlaying ? `translateX(${((tick * speed * 3) % 40)}px)` : "none",
                      transition: "none"
                    }}
                  />
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-amber-500/30" />
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-amber-500/30" />

                  {/* 沿线运输的手机实体 */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((tick * speed * 4) + 40) % 100}%`
                    }}
                  >
                    <HuaweiSmartphoneLogo size={18} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-amber-950/90 border border-amber-500/80 text-amber-200 shadow-xs whitespace-nowrap">
                      旗舰真机
                    </span>
                  </div>
                </div>

                {/* 4. 华为智能生活馆：真机展台与现货库存 */}
                <div 
                  onClick={() => setActiveStageId("retail")}
                  className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                    activeStageId === "retail" ? "scale-105" : "hover:scale-102"
                  }`}
                  title="点击解剖全渠道智能生活馆"
                >
                  <div className="w-18 h-26 sm:w-22 sm:h-30 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-indigo-500/50 flex flex-col items-center justify-center relative p-2 shadow-lg group-hover:border-indigo-400">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 border border-indigo-500/60 flex items-center justify-center text-indigo-300 mb-1 shadow-inner relative">
                      <Store className="w-5 h-5" />
                      <div className="absolute -bottom-1 -right-1">
                        <HuaweiSmartphoneLogo size={11} showGlow={false} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-200 font-bold">智能生活馆</span>
                    <span className="text-[9px] text-stone-300">授权体验店</span>

                    <div className="mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-[8px] text-emerald-400 font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>现货充足</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-300 mt-1.5 font-medium">④ 门店零售</span>
                </div>

                {/* 传送带 4：消费者购机提货 */}
                <div className="flex-1 h-11 sm:h-12 bg-stone-950 rounded-lg mx-1 sm:mx-2 relative overflow-hidden border border-emerald-900/60 flex items-center shadow-inner">
                  <div 
                    className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#10b981,#10b981_8px,transparent_8px,transparent_20px)] opacity-35"
                    style={{
                      transform: isPlaying ? `translateX(${((tick * speed * 3) % 40)}px)` : "none",
                      transition: "none"
                    }}
                  />
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-emerald-500/30" />
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-emerald-500/30" />

                  {/* 最终交付消费者的手机 */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((tick * speed * 4) + 65) % 100}%`
                    }}
                  >
                    <HuaweiSmartphoneLogo size={18} showGlow={true} />
                    <span className="mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-teal-950/90 border border-teal-400/80 text-teal-200 shadow-xs whitespace-nowrap">
                      真机交付
                    </span>
                  </div>
                </div>

                {/* 5. 终端消费者：开箱、手持新机、扫码开机激活 */}
                <div 
                  onClick={() => setActiveStageId("consumer")}
                  className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                    activeStageId === "consumer" ? "scale-105" : "hover:scale-102"
                  }`}
                  title="点击解剖终端消费扫码与激活"
                >
                  <div className="w-18 h-26 sm:w-22 sm:h-30 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-teal-500/50 flex flex-col items-center justify-center relative p-2 shadow-lg group-hover:border-teal-400">
                    <div className="w-10 h-10 rounded-lg bg-stone-800 border border-teal-500/60 flex items-center justify-center text-teal-300 mb-1 shadow-inner relative">
                      <UserCheck className="w-5 h-5" />
                      <div className="absolute -bottom-1 -right-1">
                        <HuaweiSmartphoneLogo size={11} showGlow={false} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-200 font-bold">终端消费者</span>
                    <span className="text-[9px] text-stone-300">真机在手开机</span>

                    <div className="mt-1 px-1.5 py-0.5 rounded bg-teal-900/60 border border-teal-500/40 text-[8px] text-teal-200 font-mono font-bold">
                      SN 录入即激活
                    </div>
                  </div>
                  <span className="text-[10px] text-teal-300 mt-1.5 font-medium">⑤ 消费激活</span>
                </div>
              </div>
            </div>

            {/* 下部：反向数字化信息光纤管道 (Reverse Digital Data Signal Loop - 从右往左奔涌) */}
            <div className="pt-3 border-t border-stone-800">
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="flex items-center gap-1.5 text-teal-300 font-sans font-semibold">
                  <Zap className={`w-3.5 h-3.5 ${dataPulseActive ? "text-yellow-400 animate-bounce" : "text-teal-400"}`} />
                  反向数据流 (ISC+ 数字化神经常闭环)：POS 实销扫码 ➔ 云端控制塔 ➔ 松山湖排产 ➔ 晶圆备料
                </span>
                <span className="text-teal-400 text-[10px] flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> 数据极速反哺向左穿透 (秒级)
                </span>
              </div>

              {/* 反向光纤脉冲通道 */}
              <div className="relative w-full h-8 bg-stone-900/90 rounded-lg border border-teal-900/60 flex items-center px-4 overflow-hidden">
                {/* 传统模式 vs 华为模式的信息传输表现 */}
                {mode === "huawei-isc" ? (
                  <>
                    <div 
                      className="absolute inset-0 bg-[repeating-linear-gradient(270deg,#14b8a6,#14b8a6_8px,transparent_8px,transparent_20px)] opacity-50"
                      style={{
                        transform: isPlaying ? `translateX(-${((tick * speed * 4) % 36)}px)` : "none",
                        transition: "none"
                      }}
                    />
                    {/* 逆流而行的高亮数据包光斑 */}
                    <div 
                      className="absolute w-6 h-3 rounded-full bg-teal-300 shadow-[0_0_12px_#2dd4bf] opacity-90 flex items-center justify-center text-[8px] text-stone-900 font-bold font-mono"
                      style={{
                        right: `${((tick * speed * 5) % 100)}%`
                      }}
                    >
                      POS
                    </div>
                    <div 
                      className="absolute w-6 h-3 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047] opacity-80 flex items-center justify-center text-[8px] text-stone-900 font-bold font-mono"
                      style={{
                        right: `${(((tick * speed * 5) + 50) % 100)}%`
                      }}
                    >
                      JIT
                    </div>
                    <span className="relative z-10 text-[10px] text-teal-200 font-mono">
                      [ISC+ 实时神经网] 终端扫码立即扣减全网在手，触发松山湖柔性排产并通知 VMI 供应商调拔，无任何中间层猜测！
                    </span>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-[10px] text-amber-400 font-mono">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      [传统推式模式痛点] 信息流被各级阻断！月度人工汇总报表传递缓慢（时滞 3~6 周），造成各级放大安全库存，引发严重牛鞭效应！
                    </span>
                    <span className="text-red-400 font-bold">延迟: +45 天</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 模式对比总结说明横幅 */}
        <div className="relative z-10 mt-3 p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-300">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${mode === "huawei-isc" ? "bg-teal-400" : "bg-red-400"}`} />
            <span>
              当前运作模式：
              <strong className="text-white ml-1">
                {mode === "huawei-isc" ? "华为 ISC+ 集成供应链 (拉动式协同 · 现代标杆)" : "传统阶梯推式供应链 (孤岛博弈 · 牛鞭效应高发)"}
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-stone-400">
            {mode === "huawei-isc" 
              ? "以实际终端消费 (Sell-through) 拉动生产，库存周转压缩至 21 天，全链方差稳定可控。" 
              : "以渠道铺货 (Sell-in) 与盲目销售预测为准，前瞻囤货与短缺博弈并存，库存周转长达 75 天以上。"}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 环节深度解剖与华为实战机理透视卡 (Click-to-Inspect Deep Dive Panel) */}
      {/* ===================================================================== */}
      <div id="huawei-stage-inspector" className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-3">
            {/* 动态对应环节实体物理 Logo */}
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center shrink-0 shadow-md">
              {activeStage.id === "parts" ? (
                <SiliconWaferLogo size={28} showGlow={true} />
              ) : activeStage.id === "assembly" ? (
                <div className="flex items-center gap-0.5">
                  <SiliconWaferLogo size={14} showGlow={false} />
                  <ArrowRight className="w-2.5 h-2.5 text-stone-500" />
                  <HuaweiSmartphoneLogo size={12} showGlow={false} />
                </div>
              ) : (
                <HuaweiSmartphoneLogo size={20} showGlow={true} />
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>{activeStage.name} · 实体工艺与供应链深层机理解剖</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600 font-mono font-normal">
                  {activeStage.subName}
                </span>
                {activeStage.id === "parts" && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-mono font-semibold">
                    晶圆物理形态
                  </span>
                )}
                {activeStage.id === "assembly" && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono font-semibold">
                    晶圆 ➔ 手机下线枢纽
                  </span>
                )}
                {activeStage.id !== "parts" && activeStage.id !== "assembly" && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono font-semibold">
                    整机流通形态
                  </span>
                )}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                实体归属地: <strong className="text-stone-700">{activeStage.location}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-stone-500">周转时滞: <strong className="text-stone-800">{activeStage.leadTime}</strong></span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500">方差放大: <strong className="text-teal-700">{activeStage.varianceAmplification}</strong></span>
          </div>
        </div>

        {/* 角色职责与核心作业 */}
        <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
          <strong className="text-stone-900 font-semibold">实体职能与作业目标：</strong>
          {activeStage.role}
        </p>

        {/* 四大维度细节卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. 实体车间设备与工艺治具 */}
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5">
              <Factory className="w-3.5 h-3.5 text-stone-700" />
              <span>工序自动化设备与治具</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-stone-600">
              {activeStage.equipment.map((eq, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                  <span>{eq}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. BOM 核心零部件 / 物料流明细 */}
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5">
              <Layers className="w-3.5 h-3.5 text-red-700" />
              <span>BOM 物料与流转实物清单</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-stone-600">
              {activeStage.bomParts.map((part, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span>{part}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. 华为集成供应链 (ISC) 独家管理实践 */}
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>华为 ISC+ 核心管理实践</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-stone-600">
              {activeStage.huaweiPractices.map((prac, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{prac}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. 抗牛鞭对策机理解析 */}
          <div className="p-3.5 rounded-xl bg-white border border-teal-200 bg-teal-50/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-950 border-b border-teal-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>抗击牛鞭效应破局机理</span>
            </div>
            <p className="text-[11px] text-teal-900/90 leading-relaxed">
              {activeStage.bullwhipCountermeasure}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
