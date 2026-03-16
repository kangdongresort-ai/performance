import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, User, Briefcase, Award, TrendingUp, 
  ClipboardList, FileText, X, ShieldCheck, Info
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Setup ---
// 실제 데이터를 연결하려면 본인의 Firebase 프로젝트 설정값을 넣으세요.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... 생략 ...
};
// ⚠️ 당장 동작 확인만 하려면 아래 Auth 코드는 주석 처리하고 진행하는 것을 권장합니다.
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// ...
//const db = getFirestore(app);
//const appId = typeof __app_id !== 'undefined' ? __app_id : 'hr-assessment-app';

const App = () => {
  const [role, setRole] = useState('team'); // 'team' or 'manager'
  const [showGuide, setShowGuide] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    period: '',
    position: ''
  });

  const [performances, setPerformances] = useState([
    { id: 1, title: '', result: '', kpi: '' },
    { id: 2, title: '', result: '', kpi: '' },
    { id: 3, title: '', result: '', kpi: '' },
  ]);

  const [competencies, setCompetencies] = useState({
    common: '', 
    manager: '' 
  });

  const [selfDevelopment, setSelfDevelopment] = useState('');

  // --- Authentication ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // --- 인사고과 평가지표(2025) 데이터 반영 ---
  const competencyGuideData = {
    common: [
      { 
        id: 1, 
        title: '고객만족 (Service Mind)', 
        def: '고객(내,외부)의 요구를 정확히 파악하여 신속하고 친절하게 대응하며 차별화된 환대 서비스를 제공하는 행동', 
        factors: '서비스 이미지 제고, 대인이해력, 능동적 태도, 불만 고객 응대, 신속·정확한 처리', 
        levels: [
          '자기중심적 응대, 고압적/불친절한 태도, 대인이해력 미흡',
          '서비스 이해도가 낮고 비자발적이며 단순 안내 및 지시에 그침',
          '친절하고 긍정적인 태도이며 고객의 일반적인 요구사항에 부응함',
          '서비스 사명감을 바탕으로 불편사항을 정확히 처리하고 능동적으로 대응함',
          '고객감동 수준의 응대 및 불편 해소 이상의 유용한 가치를 선제적으로 제공함'
        ]
      },
      { 
        id: 2, 
        title: '원칙과 규정준수 (Compliance & Safety)', 
        def: '복무 규정 및 시설 안전 수칙을 준수하고 사회 기본 가치와 윤리를 지키는 행동', 
        factors: '복무규정/방침 준수, 안전수칙 이행, 공정성, 도덕성, 윤리의식, 청렴', 
        levels: [
          '자의적/임시적 업무 처리, 공사 구분이 없고 규정 준수 미흡',
          '일관성 없는 규정 준수 및 비자발적인 참여',
          '개인 직무 및 조직 일반 규정을 일관되게 준수하며 업무 처리',
          '규정 및 원칙 준수의 일관성을 유지하며 능동적으로 정책 방향을 파악함',
          '전사의 모범이 되는 지속적 규정 준수 및 위험 요인 사전 파악/예방'
        ]
      },
      { 
        id: 3, 
        title: '애자일 역량 (Agility & Field Response)', 
        def: '급변하는 환경에 빠르게 대응하며, AI 및 신규 시스템/프로세스를 적극 도입·활용하여 조직의 효율성과 성과를 극대화하는 태도', 
        factors: 'AI/디지털 툴 활용도, 업무 멀티태스킹, 변화 수용, 신속 대응', 
        levels: [
          '변화에 적응하지 못하고 기존 방식만 고수하며, 신규 시스템이나 AI 활용에 소극적이고, 업무 멀티태스킹에 부정적임',
          '신규 시스템 도입 시 수동적으로 대응하고, 디지털 툴 활용 능력이 미흡하며, 업무 멀티태스킹 의지가 부족',
          '도입된 신규 시스템 및 프로세스를 숙지하여 업무에 적용, AI 등 디지털 툴의 필요성과 업무 멀티태스킹에 대해 이해',
          'AI/신규 시스템을 활용해 업무 효율을 높이며, 업무 멀티태스킹 의지가 높음',
          'AI/신기술을 활용한 혁신적 대안을 제시하며, 시장 변화에 맞춰 업무 프로세스를 민첩하게 최적화하고 업무 멀티태스킹 능력이 탁월함'
        ]
      },
      { 
        id: 4, 
        title: '목표달성 의지 (Goal Achievement)', 
        def: '직무 전문성을 갖추고 담당 업무 목표 달성 및 성과 질을 제고하기 위한 노력과 태도', 
        factors: '목표 설정, 성취욕, 인내, 책임감, 성실성, 자발성', 
        levels: [
          '담당 업무 목표 달성이 미진하고 비자발적/수동적 태도를 보임',
          '지시/보고 중심의 업무를 수행하며 주어진 목표 수준에만 만족함',
          '일관된 목표 수행 및 성과를 보이며 자발적인 개선 태도를 견지함',
          '높은 직무 전문성과 성취욕으로 일관된 상향 목표 성과를 달성함',
          '창의적 방법으로 지속적인 상향 목표를 설정하고 탁월한 성과를 창조함'
        ]
      },
      { 
        id: 5, 
        title: '도전 의식 및 자기계발 (Challenge & Self-Development)', 
        def: '업무 장애 요인을 극복하고 새로운 지식과 기술을 습득하여 목표를 달성하려는 태도', 
        factors: '장애 극복, 자기계발 노력, 지식/기술 습득욕, 진취성', 
        levels: [
          '성과 목표 달성에 무관심하고 자발적 업무 수행 능력이 미흡함',
          '상위 수준 성과에 대한 무관심 및 주어진 업무 수준에만 머무름',
          '장애 요인을 파악하여 적극적으로 처리하며 상향 목표를 이행함',
          '성과 중심의 업무 수행 태도 및 장애 요인을 자발적으로 개선함',
          '새로운 지식과 기술을 지속 습득하여 장애 극복 대안을 제시'
        ]
      },
      { 
        id: 6, 
        title: '협업 및 조직헌신 (Commitment & Teamwork)', 
        def: '조직의 이익을 우선 고려하여 구성원과 협력하고 업무에 몰입하는 행동', 
        factors: '비전/정책 이해, 조직 우선 처리, 협업 마인드, 갈등 관리 보조', 
        levels: [
          '조직 업무에 비협조적이며 사적인 업무 수행 중심으로 복무함',
          '비자발적/협조적 참여 수준이며 전사 정책에 대한 관심이 낮음',
          '전사 비전 및 정책에 대해 이해하고 협조적/자발적으로 참여함',
          '조직 업무 수행에 사적 이익을 배제하며 정책을 능동적으로 파악함',
          '조직 성과와 이익 달성을 위해 선도적으로 행동하며 비전 전파에 기여함'
        ]
      },
    ],
    manager: [
      { 
        id: 1, 
        title: '비전제시 (Visioning)', 
        def: '부서의 방향을 회사의 비전과 연계하여 구성원들에게 전파하고 솔선수범하는 역량', 
        factors: '목표/방향 설정, 가이드라인 제시, 솔선수범, 성과 지속 관리', 
        levels: [
          '부서 목표 및 방향을 제시하지 못함, 회사의 목표와 동떨어진 업무를 수행, 구성원 전파 및 관리에 무관심',
          '목표 및 방향 제시의 일관성이 부족, 회사의 목표 방향에 대한 이해도와 구성원을 독려하는 적극성 부족',
          '일관된 부서 목표 및 방향을 제시, 이에 부합하는 업무를 수행하며 일반적인 수준에서 구성원을 독려',
          '일관된 상향 목표와 업무 방향을 제시, 목표 부합한 업무수행을 위해 구성원을 독려, 스스로 솔선수범하는 자세를 보임',
          '지속적이고 세부적인 상향 목표를 제시, 창의적·혁신적 업무 수행을 이끌고, 목표 달성을 위해 선도적으로 구성원 독려도'
        ]
      },
      { 
        id: 2, 
        title: '인재육성 및 코칭 (Talent Development)', 
        def: '부하직원에게 도전 기회를 제공하고 지속적인 조언을 통해 체계적 발전을 도모하는 역량', 
        factors: '교육/능력향상 기회 제공, 관심과 조언, 피드백, 전문가 육성', 
        levels: [
          '능력 향상을 위한 기회 제공이 전무, 성장을 위한 관심이나 피드백을 미실시',
          '특정 인원 교육 기회 편중, 회사 정책과 연관성 낮은 교육 실시, 주로 훈육 위주의 피드백에 머무름',
          '회사 정책 및 직무에 부합하는 일반적인 교육, 능력 향상 기회를 제공, 일상적인 수준 관리',
          '구성원에게 공평한 교육 기회를 부여, 성장을 위해 능동적으로 관심을 가지고 적절한 조언과 코칭을 수행',
          '회사 정책에 따른 전문가 육성 체계 구축, 업무성과 향상을 위한 구체적 조언과 피드백으로 구성원의 역량을 극대화'
        ]
      },
      { 
        id: 3, 
        title: '조직관리 및 조정통합 (Management & Coordination)', 
        def: '효율적 인적 자원 관리와 공정한 태도로 내외부 갈등 상황을 해결하는 역량', 
        factors: '업무 분장, 평가 관리, 팀워크, 소통, 문제 해결, 협상력', 
        levels: [
          '특정 인원에게 업무 편중 등 비효율적 인력구성, 소통 없는 상명하복 체계 유지, 부서간 이기주의 조장',
          '개인 능력을 고려치 않은 업무 분장, 갈등 상황 발생 시 상황 판단력 미흡으로 단편적인 해결안만 제시, 부서간 협업 안됨',
          '일반적인 수준 업무 분장과 인력 구성, 목표 달성을 위한 소통과 합리적 해결 방안 모색하여 갈등 상황을 완화',
          '개인 능력에 따른 적절한 업무 분장, 갈등 상황을 해소하는 합리적 해결책을 제시, 부서간 협업을 위해 소통하고 노력함',
          '능력향상, 동기부여 가능한 효율적 업무 분장, 명확한 의사결정, 소통으로 갈등 종결, 발전적 대안 제시, 부서간 협업과 소통 탁월'
        ]
      },
    ]
  };

  const addPerformanceRow = () => setPerformances([...performances, { id: Date.now(), title: '', result: '', kpi: '' }]);
  const removePerformanceRow = (id) => performances.length > 1 && setPerformances(performances.filter(p => p.id !== id));
  const handlePerfChange = (id, field, value) => setPerformances(performances.map(p => p.id === id ? { ...p, [field]: value } : p));
  const handleCompChange = (field, value) => setCompetencies({ ...competencies, [field]: value });

  const exportToWord = () => {
    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Malgun Gothic', sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 10px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .title { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 30px; }
        .section { font-size: 14pt; font-weight: bold; color: #2563eb; border-bottom: 2px solid #2563eb; margin-top: 20px; margin-bottom: 10px; }
      </style></head>
      <body>
        <div class="title">인사고과 개인 업무성과 및 역량평가 기술서 (2025)</div>
        <div class="section">1. 기본 정보</div>
        <table>
          <tr><th>소속</th><td>${userInfo.department}</td><th>직위</th><td>${userInfo.position}</td></tr>
          <tr><th>성명</th><td>${userInfo.name}</td><th>평가기간</th><td>${userInfo.period}</td></tr>
        </table>
        <div class="section">2. 주요 업무성과</div>
        <table>
          <thead><tr><th>업무제목</th><th>업무실적</th><th>KPI</th></tr></thead>
          <tbody>${performances.map(p => `<tr><td>${p.title}</td><td>${p.result}</td><td>${p.kpi}</td></tr>`).join('')}</tbody>
        </table>
        <div class="section">3. 역량 기술서 (공통 6종)</div>
        <p>${competencies.common.replace(/\n/g, '<br/>') || '기입 내용 없음'}</p>
        ${role === 'manager' ? `<div class="section">3-1. 역량 기술서 (관리자 3종)</div><p>${competencies.manager.replace(/\n/g, '<br/>') || '기입 내용 없음'}</p>` : ''}
        <div class="section">4. 자기계발 노력</div>
        <div style="border:1px solid #000; padding:15px;">${selfDevelopment.replace(/\n/g, '<br/>') || '기입 내용 없음'}</div>
      </body></html>
    `;
    const blob = new Blob([docContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `업무성과기술서_${userInfo.name || '미기입'}.doc`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans relative pb-24">
      
      {/* Guide Modal - 2025 최신 지표 내용 */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3"><FileText size={24} className="text-emerald-500"/><h2 className="text-xl font-bold">역량평가지표 상세 내용 (2025 표준)</h2></div>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-10">
              <section>
                <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> 공통 및 직무역량 지표 (6종)
                </h3>
                <div className="space-y-6">
                  {competencyGuideData.common.map(c => (
                    <div key={c.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-base">{c.id}. {c.title}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-600 block mb-1">정의</span>
                            <p className="text-sm text-slate-700 leading-relaxed">{c.def}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 block mb-1">평가 요인</span>
                            <p className="text-sm text-slate-600 leading-relaxed">{c.factors}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {c.levels.map((text, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl hover:border-emerald-200 transition-colors">
                              <div className="text-[10px] font-black text-emerald-500 mb-1.5">Level {idx + 1}</div>
                              <p className="text-[11px] text-slate-600 leading-snug">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div> 리더십 역량 지표 (3종)
                </h3>
                <div className="space-y-6">
                  {competencyGuideData.manager.map(c => (
                    <div key={c.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-base">{c.id}. {c.title}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-600 block mb-1">정의</span>
                            <p className="text-sm text-slate-700 leading-relaxed">{c.def}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 block mb-1">평가 요인</span>
                            <p className="text-sm text-slate-600 leading-relaxed">{c.factors}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {c.levels.map((text, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl hover:border-blue-200 transition-colors">
                              <div className="text-[10px] font-black text-blue-500 mb-1.5">Level {idx + 1}</div>
                              <p className="text-[11px] text-slate-600 leading-snug">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="p-4 bg-slate-50 border-t text-center"><button onClick={() => setShowGuide(false)} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold">확인 완료</button></div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg"><Award size={32} /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">개인 업무성과 및 역량평가 기술서</h1>
              <p className="text-slate-500 text-sm italic">2025년 최신 평가지표를 기반으로 당신의 성과를 기록하세요.</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setRole('team')} className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${role === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>팀원용</button>
            <button onClick={() => setRole('manager')} className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${role === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>관리자용</button>
          </div>
        </header>

        {/* User Info */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: '소속부서', key: 'department', icon: Briefcase, placeholder: '부서명 입력' },
            { label: '직위', key: 'position', icon: Award, placeholder: '직위 입력' },
            { label: '성명', key: 'name', icon: User, placeholder: '성명 입력' },
            { label: '평가기간', key: 'period', icon: TrendingUp, placeholder: '예: 2025년 상반기' }
          ].map((item) => (
            <div key={item.key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-400 block mb-2 flex items-center gap-1 uppercase tracking-tighter"><item.icon size={14} /> {item.label}</label>
              <input type="text" value={userInfo[item.key]} onChange={(e) => setUserInfo({...userInfo, [item.key]: e.target.value})} placeholder={item.placeholder} className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-medium placeholder:italic placeholder:text-slate-300 outline-none"/>
            </div>
          ))}
        </section>

        {/* Work Performance */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> 주요 업무성과</h2>
              <p className="text-[11px] text-blue-600 mt-1 font-bold">*회사 및 관리자가 부여한 업무에 대한 성과 및 실적에 대해 작성하시오.</p>
            </div>
            <button onClick={addPerformanceRow} className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-all"><Plus size={16} /> 행 추가</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-4 border-b w-1/4">업무제목</th>
                  <th className="p-4 border-b w-5/12">업무실적 (상세기술)</th>
                  <th className="p-4 border-b w-1/4">KPI (기여도/달성도)</th>
                  <th className="p-4 border-b w-24 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performances.map((p, index) => (
                  <tr key={p.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 align-top"><textarea value={p.title} onChange={(e) => handlePerfChange(p.id, 'title', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none placeholder:italic placeholder:text-slate-300" placeholder="예: 객실 정비 및 위생 관리" rows={3}/></td>
                    <td className="p-4 align-top"><textarea value={p.result} onChange={(e) => handlePerfChange(p.id, 'result', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none placeholder:italic placeholder:text-slate-300 leading-relaxed" placeholder="- 전 객실 딥클리닝 매뉴얼 수립\n- 노후 비품 교체 및 관리 전산화" rows={3}/></td>
                    <td className="p-4 align-top"><textarea value={p.kpi} onChange={(e) => handlePerfChange(p.id, 'kpi', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none placeholder:italic placeholder:text-slate-300" placeholder="예: 위생 점검 A등급 획득" rows={3}/></td>
                    <td className="p-4 align-top text-center"><button onClick={() => removePerformanceRow(p.id)} className="text-slate-300 hover:text-red-500 p-2 rounded transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Competencies */}
        <section className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold flex items-center gap-2"><div className="w-2 h-6 bg-emerald-500 rounded-full"></div> 역량 기술서 (공통 6종)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 lg:col-span-3">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><ClipboardList size={16} className="text-emerald-500" /> 공통 역량 리스트</h3>
                  <ul className="text-[11px] text-slate-600 space-y-3 flex-1">
                    {competencyGuideData.common.map(c => <li key={c.id} className="flex items-center gap-2"><span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-700 font-bold text-[9px]">{c.id}</span> {c.title}</li>)}
                  </ul>
                  <button onClick={() => setShowGuide(true)} className="mt-6 w-full py-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl text-[11px] font-bold hover:bg-emerald-50 transition-all shadow-sm tracking-tighter">역량평가지표 상세 내용</button>
                </div>
              </div>
              <div className="md:col-span-8 lg:col-span-9">
                <textarea value={competencies.common} onChange={(e) => handleCompChange('common', e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-100 p-6 text-sm min-h-[350px] transition-all focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none" placeholder="공통 역량(고객만족, 규정준수, 애자일 등) 성과를 통합 기술하세요. 상세 지표의 Level 3~5 내용을 참고하십시오."/>
              </div>
            </div>
          </div>

          {role === 'manager' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> 역량 기술서 (관리자 3종) <span className="text-xs font-normal text-rose-500 ml-2 italic tracking-tight font-bold">*관리자(팀장, 부팀장)만 작성하시오!</span></h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 h-full">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-500" /> 리더십 역량 리스트</h3>
                    <ul className="text-[11px] text-slate-600 space-y-3">
                      {competencyGuideData.manager.map(c => <li key={c.id} className="flex items-center gap-2"><span className="w-5 h-5 flex items-center justify-center rounded bg-blue-100 text-blue-700 font-bold text-[9px]">{c.id}</span> {c.title}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                  <textarea value={competencies.manager} onChange={(e) => handleCompChange('manager', e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-100 p-6 text-sm min-h-[300px] focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none" placeholder="관리자로서의 리더십 성과(비전제시, 인재육성, 조직관리)를 기술하세요."/>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Self Development */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><div className="w-2 h-6 bg-amber-500 rounded-full"></div> 자기계발 노력</h2>
          </div>
          <div className="p-6">
            <textarea value={selfDevelopment} onChange={(e) => setSelfDevelopment(e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-100 p-6 text-sm min-h-[150px] transition-all focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none" placeholder="전문성 향상을 위해 본인이 노력한 교육 수강, 자격증 취득 등을 기입하세요."/>
          </div>
        </section>

        {/* Sticky Actions - 보고서 발송 버튼 제거 */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-200">
          <button onClick={exportToWord} className="flex items-center gap-2 px-12 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-all active:scale-95 text-sm shadow-xl"><Download size={18} /> Word 다운로드</button>
        </div>
      </div>
    </div>
  );
};

export default App;