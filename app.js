/* Dealit Financial OS v3.0
   Mobile-first UX + Executive cockpit + Decision alerts + Store health + Mobile matrix + What-if simulator.
   Firebase Cloud + Accounting + Feasibility + Break-even + Loyalty Engine.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, updatePassword, setPersistence, browserLocalPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc,
  query, orderBy, limit, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiRpG5A8vC2iCftWUDr8eEh-sUEBnaiD8",
  authDomain: "dealit-financial-os.firebaseapp.com",
  projectId: "dealit-financial-os",
  storageBucket: "dealit-financial-os.firebasestorage.app",
  messagingSenderId: "501239470138",
  appId: "1:501239470138:web:a28b0ec3b15c3cef737d03",
  measurementId: "G-BF0KBHLYV5"
};

const WORKSPACE_ID = "dealit-main";
const WORKSPACE_REF_PATH = ["workspaces", WORKSPACE_ID];
const DEFAULT_LANG = "ar";
// Put your first admin email here too. Firestore rules must have the same email.
const BOOTSTRAP_ADMIN_EMAILS = ["azhar.mohd.said@gmail.com"];
const DEFAULT_FIRST_LOGIN_PASSWORD = "123456";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Secondary Auth app used only by Admin page to create users in Firebase Authentication
// without switching the currently signed-in Admin session.
const authCreatorApp = initializeApp(firebaseConfig, "dealit-admin-auth-creator");
const authCreator = getAuth(authCreatorApp);
const db = getFirestore(app);
analyticsSupported().then(ok => { if (ok) getAnalytics(app); }).catch(() => {});

const I18N = {
  ar: {
    brandSubtitle:'نظام مالي ودراسة جدوى', cloudMode:'حفظ سحابي عبر Firebase', cloudWaiting:'بانتظار حالة السحابة', cloudSaved:'محفوظ على السحابة', cloudSaving:'جارٍ الحفظ...', cloudOffline:'غير متصل/بحاجة تسجيل دخول',
    theme:'الثيم', undo:'تراجع', saveNow:'حفظ الآن', logout:'خروج', login:'دخول', signup:'إنشاء حساب', resetPassword:'استعادة كلمة المرور', email:'الإيميل', username:'اسم المستخدم', password:'كلمة المرور', showPassword:'إظهار كلمة المرور', rememberMe:'تذكرني', authHint:'أول Admin يحتاج Setup Rules أو Bootstrap email في Firestore rules.',
    eyebrow:'قمرة دراسة الجدوى، المحاسبة، ونقطة التعادل لتطبيق Dealit', Dashboard:'لوحة القيادة', Merchants:'المتاجر', Sectors:'القطاعات', Subscriptions:'الاشتراكات', Items:'الإيرادات والمصاريف', Points:'النقاط', Scenarios:'السيناريوهات', Breakeven:'نقطة التعادل', Accounting:'المحاسبة', Reports:'التقارير', StoreAttraction:'قوة جذب المتجر', PointMatrix:'مصفوفة صرف النقاط', Admin:'الإدارة', Settings:'الإعدادات',
    scenarioComparison:'مقارنة السيناريوهات', scenarioComparisonSub:'أسوأ، مقبول، وأفضل حالة حسب سلوك استخدام النقاط.', profitBridge:'جسر الربحية', profitBridgeSub:'كيف تتحول المبيعات إلى ربح Dealit بعد النقاط والرسوم والمصاريف.', financialPulse:'نبض النظام المالي', financialPulseSub:'متوسط العمولة يحسب موزونًا حسب GMV وليس متوسطًا بسيطًا.', decisionRadar:'رادار القرار', decisionRadarSub:'استنتاجات تلقائية من النموذج الحالي.',
    merchants:'المتاجر والعقود', merchantsSub:'العمولة، النقاط، حد الصرف، تواريخ العقد وحجم الطلبات المتوقع.', addMerchant:'إضافة متجر', sectorDefaults:'شجرة القطاعات والافتراضات', sectorDefaultsSub:'قطاعات رئيسية وفرعية. الافتراضات قابلة للتعديل وتُستخدم عند إضافة متجر.', addSector:'إضافة قطاع', resetDefaults:'استعادة القطاعات', merchantPlans:'باقات المتاجر', merchantPlansSub:'اشتراك شهري/سنوي ونسبة مخصصة للتسويق.', userPlans:'باقات المستخدمين', userPlansSub:'الباقات ترفع حد صرف النقاط أو تخفض التوصيل لاحقًا.', addPlan:'إضافة باقة',
    revenueItems:'بنود الإيراد', revenueItemsSub:'إعلانات، رسوم انضمام، عروض ممولة، تقارير، وأي مصدر دخل.', expenseItems:'بنود المصاريف', expenseItemsSub:'ثابت، متغير، نسبة من GMV، نسبة من العمولة أو مرة واحدة.', addRevenue:'إضافة إيراد', addExpense:'إضافة مصروف', pointsEngine:'محرك النقاط', pointsEngineSub:'التزام النقاط، الانتهاء، breakage، نقاط أساسية/إضافية/حملات.', campaigns:'الحملات', campaignsSub:'نمذجة نقاط إضافية ممولة من Dealit أو المتجر أو مشتركة.', addCampaign:'إضافة حملة',
    scenarioLab:'مختبر السيناريوهات', scenarioLabSub:'نسبة استخدام النقاط، النمو، التسرب، النقاط الإضافية، رسوم الدفع ودعم التوصيل.', breakEvenLab:'مختبر نقطة التعادل', breakEvenLabSub:'نقطة التعادل للتطبيق كاملًا ولكل قطاع.', sectorBreakEven:'مساهمة القطاعات', sectorBreakEvenSub:'أي القطاعات تحمل اقتصاديات المشروع.',
    plStatement:'قائمة الربح والخسارة', plSub:'P&L إدارية مبنية على الطلبات المسلّمة.', balanceView:'عرض شبيه بالميزانية', balanceSub:'التزام النقاط، احتياطي التسويق، وذمم العمولة.', journalEntries:'قيود يومية تلقائية', journalSub:'قيود إرشادية مولدة من السيناريو الحالي.', chartAccounts:'دليل الحسابات', chartAccountsSub:'خريطة حسابات قابلة للتعديل للربط المحاسبي لاحقًا.',
    reports:'التقارير والتصدير', reportsSub:'تصدير ملخص إداري، Excel، CSV، JSON، PDF قابل للطباعة أو PowerPoint.', storeAttractionTitle:'قوة جذب المتجر', storeAttractionSub:'درجة جذب كل متجر لصرف النقاط والتفاوض مع الشركاء.', storeAttractionChart:'حصة الجذب', storeAttractionChartSub:'الحصة المتوقعة للأماكن التي يفضل المستخدم صرف النقاط فيها.', pointMatrixTitle:'مصفوفة احتمالات صرف النقاط', pointMatrixSub:'كل صف يوضح أين يُتوقع صرف النقاط المكتسبة من متجر معيّن حسب قوة جذب المتاجر المستقبلة.', exportExcel:'تصدير Excel', exportCsv:'تصدير CSV', exportJson:'تصدير JSON', printPdf:'طباعة / PDF', exportPpt:'تصدير PowerPoint',
    usersRoles:'المستخدمون والصلاحيات', usersRolesSub:'أضف المستخدم مباشرة إلى Firebase Authentication مع الصلاحية وإرسال رابط تعيين كلمة المرور.', addUser:'إضافة مستخدم', auditLog:'سجل التعديلات', auditLogSub:'كل تعديل مهم جاهز للتخزين في Firestore audit collection.', firebaseOps:'عمليات Firebase', firebaseOpsSub:'حفظ سحابي، مزامنة مباشرة، وفحوصات الإعداد.',
    settings:'الإعدادات العامة', settingsSub:'JOD، رسوم الدفع، أشهر التوقع، تاريخ السنة المالية، وسلوك النظام.',
    name:'الاسم', sector:'القطاع', subSector:'قطاع فرعي', orders:'طلبات/شهر', aov:'متوسط الطلب', commission:'عمولة %', reward:'نقاط %', cap:'حد صرف %', subscription:'اشتراك JOD', margin:'هامش المتجر %', gmv:'GMV', action:'إجراء', type:'النوع', amount:'القيمة', basis:'الأساس', status:'الحالة', value:'القيمة', metric:'المؤشر', delete:'حذف', active:'فعال', yes:'نعم', no:'لا', annual:'سنوي', monthly:'شهري', fixed:'ثابت شهري', oneTime:'مرة واحدة', percentGMV:'% من GMV', percentCommission:'% من العمولة', perOrder:'لكل طلب', role:'الصلاحية', fullAccess:'صلاحية كاملة', readOnly:'قراءة فقط', notAllowed:'غير مسموح',
    saved:'تم الحفظ', loaded:'تم تحميل البيانات من Firebase', noAccess:'لا تملك صلاحية الوصول. اطلب من Admin إضافتك.', needAdmin:'هذه العملية تحتاج Admin.', editBlocked:'صلاحيتك قراءة فقط.', undoDone:'تم التراجع', exportOk:'تم تجهيز الملف', pptMissing:'مكتبة PowerPoint لم تُحمّل. افتح الصفحة بوجود إنترنت ثم حاول مجددًا.',
    signInError:'تعذر تسجيل الدخول', signUpError:'تعذر إنشاء الحساب', resetSent:'تم إرسال رابط استعادة كلمة المرور', resetError:'تعذر إرسال رابط الاستعادة'
  },
  en: {
    brandSubtitle:'Financial Operating System', cloudMode:'Firebase cloud autosave', cloudWaiting:'Waiting for cloud status', cloudSaved:'Saved to cloud', cloudSaving:'Saving...', cloudOffline:'Offline / login required',
    theme:'Theme', undo:'Undo', saveNow:'Save now', logout:'Logout', login:'Login', signup:'Sign up', resetPassword:'Reset password', email:'Email', username:'Username', password:'Password', showPassword:'Show my password', rememberMe:'Remember me', authHint:'First admin needs setup rules or bootstrap email in Firestore rules.',
    eyebrow:'Dealit feasibility, accounting & break-even cockpit', Dashboard:'Dashboard', Merchants:'Merchants', Sectors:'Sectors', Subscriptions:'Subscriptions', Items:'Revenue & Expenses', Points:'Points', Scenarios:'Scenarios', Breakeven:'Break-even', Accounting:'Accounting', Reports:'Reports', StoreAttraction:'Store Attraction', PointMatrix:'Point Matrix', Admin:'Admin', Settings:'Settings',
    scenarioComparison:'Scenario comparison', scenarioComparisonSub:'Worst, acceptable and best case based on redemption behavior.', profitBridge:'Profit bridge', profitBridgeSub:'How GMV becomes Dealit profit after points, fees and expenses.', financialPulse:'Financial pulse', financialPulseSub:'Weighted commission is calculated by GMV, not by simple average.', decisionRadar:'Decision radar', decisionRadarSub:'Automatic findings from the current model.',
    merchants:'Merchants & contracts', merchantsSub:'Commission, reward, redemption cap, contract dates and expected volume.', addMerchant:'Add merchant', sectorDefaults:'Sector tree & default assumptions', sectorDefaultsSub:'Large sectors with sub-sectors. Defaults are editable and used when adding new merchants.', addSector:'Add sector', resetDefaults:'Reset sectors', merchantPlans:'Merchant plans', merchantPlansSub:'Monthly/annual fees and marketing reserve share.', userPlans:'User plans', userPlansSub:'Plans can increase redemption cap or reduce delivery fees later.', addPlan:'Add plan',
    revenueItems:'Revenue items', revenueItemsSub:'Ads, setup fees, sponsored offers, reports and any extra stream.', expenseItems:'Expense items', expenseItemsSub:'Fixed, variable, percent of GMV, percent of commission or one-time.', addRevenue:'Add revenue', addExpense:'Add expense', pointsEngine:'Points engine', pointsEngineSub:'Point liability, expiry, breakage, base/bonus/campaign points.', campaigns:'Campaigns', campaignsSub:'Model bonus points funded by Dealit, merchants or shared.', addCampaign:'Add campaign',
    scenarioLab:'Scenario lab', scenarioLabSub:'Redemption, growth, churn, bonus points, payment fees and delivery subsidy.', breakEvenLab:'Break-even lab', breakEvenLabSub:'Break-even by total app and by sector.', sectorBreakEven:'Sector contribution', sectorBreakEvenSub:'Which sectors carry the economics.',
    plStatement:'Profit & Loss', plSub:'Management P&L based on delivered orders.', balanceView:'Balance-style view', balanceSub:'Point liability, marketing reserve and merchant receivables.', journalEntries:'Automatic journal entries', journalSub:'Illustrative entries generated from the current scenario.', chartAccounts:'Chart of accounts', chartAccountsSub:'Editable account map for future accounting integration.',
    reports:'Reports & exports', reportsSub:'Export management summary, Excel, CSV, JSON, printable PDF or PowerPoint.', storeAttractionTitle:'Store attraction power', storeAttractionSub:'Score each merchant’s pull power for redemption probability and partner negotiations.', storeAttractionChart:'Attraction share', storeAttractionChartSub:'Expected share of where users will prefer to spend points.', pointMatrixTitle:'Point redemption probability matrix', pointMatrixSub:'Each row shows where points earned from one merchant are likely to be redeemed, based on destination store attraction.', exportExcel:'Export Excel', exportCsv:'Export CSV', exportJson:'Export JSON', printPdf:'Print / PDF', exportPpt:'Export PowerPoint',
    usersRoles:'Users & roles', usersRolesSub:'Create the user directly in Firebase Authentication with a role and send a password setup email.', addUser:'Add user', auditLog:'Audit log', auditLogSub:'Every meaningful change is ready for Firestore audit collection.', firebaseOps:'Firebase operations', firebaseOpsSub:'Cloud save, real-time sync and setup checks.',
    settings:'General settings', settingsSub:'JOD, payment fees, forecast months, fiscal date and system behavior.',
    name:'Name', sector:'Sector', subSector:'Sub-sector', orders:'Orders/month', aov:'AOV', commission:'Commission %', reward:'Reward %', cap:'Cap %', subscription:'Subscription JOD', margin:'Merchant margin %', gmv:'GMV', action:'Action', type:'Type', amount:'Amount', basis:'Basis', status:'Status', value:'Value', metric:'Metric', delete:'Delete', active:'Active', yes:'Yes', no:'No', annual:'Annual', monthly:'Monthly', fixed:'Fixed monthly', oneTime:'One-time', percentGMV:'% of GMV', percentCommission:'% of commission', perOrder:'Per order', role:'Role', fullAccess:'Full access', readOnly:'Read only', notAllowed:'Not allowed',
    saved:'Saved', loaded:'Loaded from Firebase', noAccess:'You do not have access. Ask Admin to add you.', needAdmin:'This action requires Admin.', editBlocked:'Your role is read-only.', undoDone:'Undo applied', exportOk:'File prepared', pptMissing:'PowerPoint library was not loaded. Open the page with internet and try again.',
    signInError:'Could not sign in', signUpError:'Could not sign up', resetSent:'Password reset email sent', resetError:'Could not send reset email'
  }
};

const NAV = [
  ['dashboard','Dashboard','⌁'], ['merchants','Merchants','▦'], ['sectors','Sectors','◇'], ['subscriptions','Subscriptions','◉'], ['items','Items','＋'], ['points','Points','✦'], ['scenarios','Scenarios','▣'], ['breakeven','Breakeven','△'], ['storeAttraction','StoreAttraction','◎'], ['pointMatrix','PointMatrix','⌗'], ['accounting','Accounting','▤'], ['reports','Reports','⇩'], ['admin','Admin','⚙'], ['settings','Settings','☷']
];
const ROLES = ['admin','partner','investor','accountant'];
const WRITE_ROLES = ['admin','accountant'];
const ADMIN_ONLY = ['admin'];
const SCENARIO_KEYS = ['worst','acceptable','best'];

const DEFAULT_SECTORS = [
  ['Food & Beverage','Restaurants',12,4,35], ['Food & Beverage','Cafes',13,4,38], ['Food & Beverage','Desserts & Bakeries',14,5,42], ['Food & Beverage','Healthy Meals',15,5,45], ['Food & Beverage','Grocery & Mini Markets',5,2,15],
  ['Electronics','Mobiles',3,1,8], ['Electronics','Mobile Accessories',10,4,30], ['Electronics','Computers & Laptops',4,1,12], ['Electronics','Home Appliances',5,2,16], ['Electronics','Gaming Accessories',8,3,25],
  ['Fashion','Clothing',15,6,45], ['Fashion','Shoes',14,5,42], ['Fashion','Bags & Accessories',16,6,50], ['Fashion','Kids Wear',13,5,40],
  ['Health & Medical','Pharmacies - OTC',6,2,18], ['Health & Medical','Clinics',10,3,35], ['Health & Medical','Dental Clinics',10,3,38], ['Health & Medical','Optics',12,4,42], ['Health & Medical','Labs & Diagnostics',8,2,28],
  ['Beauty & Personal Care','Beauty Salons',16,6,55], ['Beauty & Personal Care','Barbershops',14,5,50], ['Beauty & Personal Care','Cosmetics',12,4,38], ['Beauty & Personal Care','Spa & Wellness',18,7,58],
  ['Furniture & Home','Furniture',8,3,28], ['Furniture & Home','Home Decor',14,5,45], ['Furniture & Home','Kitchenware',11,4,35], ['Furniture & Home','Mattresses',8,3,30],
  ['Travel & Tourism','Domestic Trips',8,3,22], ['Travel & Tourism','Hotels',6,2,18], ['Travel & Tourism','Flight Tickets',2,0.5,6], ['Travel & Tourism','Car Rental',8,2,22], ['Travel & Tourism','Experiences',14,5,45],
  ['Fitness & Wellness','Gyms',16,6,60], ['Fitness & Wellness','Sports Academies',14,5,45], ['Fitness & Wellness','Physiotherapy',10,3,35],
  ['Education','Courses',15,5,55], ['Education','Tutoring',12,4,45], ['Education','Books & Stationery',9,3,30],
  ['Automotive','Car Wash',15,5,50], ['Automotive','Maintenance',10,3,28], ['Automotive','Accessories',12,4,35], ['Automotive','Tires & Batteries',6,2,18],
  ['Entertainment','Kids Activities',15,5,50], ['Entertainment','Cinemas & Events',8,3,20], ['Entertainment','Family Activities',14,5,45],
  ['Home Services','Cleaning',15,5,50], ['Home Services','Maintenance Services',12,4,38], ['Home Services','Laundry',10,4,35],
  ['Baby & Kids','Baby Products',8,3,25], ['Baby & Kids','Toys',13,5,38], ['Pets','Pet Shops',11,4,35], ['Professional Services','Consulting',12,3,50], ['Professional Services','Photography',15,5,55]
].map((r,i)=>({id:`sec_${i+1}`,parent:r[0],name:r[1],commissionPct:r[2],rewardPct:r[3],merchantMarginPct:r[4],active:true}));

function uid(prefix='id'){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function defaultState(){
  return {
    version:3.0, lang:DEFAULT_LANG, currentPage:'dashboard', activeScenario:'acceptable', activeReportTab:'summary', viewMode:'founder', lastUpdated:null, pointMatrixOverrides:{},
    settings:{currency:'JOD',fiscalStart:'Company registration date',periodMonths:12,forecastMonths:24,pointValue:1,pointExpiryMonths:24,paymentFeePct:2.5,paymentGatewayMonthlyFee:0,generalRedemptionCapPct:50,marketingReservePct:25,treatMarketingReserveAsExpense:true,deliveryInScope:false,deliveryProfit:false,vatAsSeparateLine:true,autoSave:true},
    sectors: JSON.parse(JSON.stringify(DEFAULT_SECTORS)),
    merchants:[
      {id:uid('m'),name:'Pilot Restaurant',sector:'Food & Beverage',subSector:'Restaurants',monthlyOrders:420,aov:9,commissionPct:12,rewardPct:4,redemptionCapPct:50,subscription:60,subscriptionCycle:'monthly',merchantMarginPct:35,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true},
      {id:uid('m'),name:'Mobile Store',sector:'Electronics',subSector:'Mobiles',monthlyOrders:65,aov:190,commissionPct:3,rewardPct:1,redemptionCapPct:35,subscription:80,subscriptionCycle:'monthly',merchantMarginPct:8,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true},
      {id:uid('m'),name:'Beauty Clinic',sector:'Beauty & Personal Care',subSector:'Beauty Salons',monthlyOrders:120,aov:28,commissionPct:16,rewardPct:6,redemptionCapPct:60,subscription:120,subscriptionCycle:'monthly',merchantMarginPct:55,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true},
      {id:uid('m'),name:'Domestic Trips Partner',sector:'Travel & Tourism',subSector:'Domestic Trips',monthlyOrders:45,aov:85,commissionPct:8,rewardPct:3,redemptionCapPct:45,subscription:100,subscriptionCycle:'monthly',merchantMarginPct:22,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true}
    ],
    merchantPlans:[
      {id:uid('mp'),name:'Basic',fee:25,cycle:'monthly',pushWeight:1,marketingReservePct:15,active:true},
      {id:uid('mp'),name:'Growth',fee:75,cycle:'monthly',pushWeight:2,marketingReservePct:25,active:true},
      {id:uid('mp'),name:'Premium',fee:180,cycle:'monthly',pushWeight:4,marketingReservePct:35,active:true}
    ],
    userPlans:[
      {id:uid('up'),name:'Free',fee:0,cycle:'monthly',users:500,redemptionCapPct:30,pointsBoostPct:0,deliveryDiscountPct:0,active:true},
      {id:uid('up'),name:'Plus',fee:3,cycle:'monthly',users:120,redemptionCapPct:50,pointsBoostPct:10,deliveryDiscountPct:10,active:true},
      {id:uid('up'),name:'Premium',fee:7,cycle:'monthly',users:40,redemptionCapPct:70,pointsBoostPct:20,deliveryDiscountPct:25,active:true}
    ],
    revenues:[
      {id:uid('r'),name:'Sponsored placement',type:'fixed_monthly',amount:300,active:true},
      {id:uid('r'),name:'Merchant setup fees',type:'one_time',amount:500,active:true},
      {id:uid('r'),name:'Insights reports',type:'fixed_monthly',amount:150,active:true}
    ],
    expenses:[
      {id:uid('e'),name:'Marketing budget',type:'fixed_monthly',amount:900,active:true},
      {id:uid('e'),name:'Customer support',type:'fixed_monthly',amount:450,active:true},
      {id:uid('e'),name:'Legal / Accounting',type:'fixed_monthly',amount:150,active:true},
      {id:uid('e'),name:'Cloud & tools',type:'fixed_monthly',amount:80,active:true},
      {id:uid('e'),name:'Refund reserve',type:'percent_gmv',amount:0.5,active:true},
      {id:uid('e'),name:'Operations per order',type:'per_order',amount:0.12,active:true}
    ],
    scenarios:{
      worst:{name:'Worst case',redemptionRate:90,breakageRate:10,monthlyGrowthPct:1,churnPct:5,bonusPointsPct:2,paymentFeePct:3,deliverySubsidyPerOrder:0.2},
      acceptable:{name:'Acceptable',redemptionRate:70,breakageRate:30,monthlyGrowthPct:4,churnPct:2.5,bonusPointsPct:1,paymentFeePct:2.5,deliverySubsidyPerOrder:0},
      best:{name:'Best case',redemptionRate:50,breakageRate:50,monthlyGrowthPct:8,churnPct:1,bonusPointsPct:0.5,paymentFeePct:2.2,deliverySubsidyPerOrder:0}
    },
    campaigns:[
      {id:uid('c'),name:'Launch double points weekend',sector:'Food & Beverage',bonusPointsPct:3,funding:'dealit',dealitSharePct:100,monthlyBudget:0,active:true},
      {id:uid('c'),name:'Beauty boost',sector:'Beauty & Personal Care',bonusPointsPct:4,funding:'shared',dealitSharePct:50,monthlyBudget:0,active:true}
    ],
    accounts:[
      {id:'1010',name:'Cash / Bank',class:'Asset',type:'Current Asset'}, {id:'1100',name:'Merchant commission receivable',class:'Asset',type:'Receivable'},
      {id:'2010',name:'Point liability',class:'Liability',type:'Current Liability'}, {id:'2020',name:'Marketing reserve',class:'Liability',type:'Reserve'},
      {id:'3010',name:'Founder equity',class:'Equity',type:'Equity'}, {id:'4010',name:'Commission revenue',class:'Income',type:'Revenue'},
      {id:'4020',name:'Merchant subscriptions',class:'Income',type:'Revenue'}, {id:'4030',name:'User subscriptions',class:'Income',type:'Revenue'}, {id:'4040',name:'Other revenue',class:'Income',type:'Revenue'},
      {id:'5010',name:'Loyalty points expense',class:'Expense',type:'Variable Expense'}, {id:'5020',name:'Payment gateway fees',class:'Expense',type:'Variable Expense'}, {id:'5030',name:'Marketing expense',class:'Expense',type:'Fixed Expense'}, {id:'5040',name:'Operating expenses',class:'Expense',type:'Fixed/Variable'}
    ],
    invitedUsers:[],
    audit:[]
  };
}
let state = defaultState();
let currentUser = null;
let currentProfile = null;
let currentRole = 'guest';
let lastLoginPassword = '';
let unsubscribeWorkspace = null;
let saveTimer = null;
let cloudDirty = false;
let suppressRemote = false;
let undoStack = [];
let charts = {};

function t(key){return I18N[state.lang]?.[key] || I18N.en[key] || key}
function n(v){const x = Number(v); return Number.isFinite(x)?x:0}
function fmt(v,dec=0){return new Intl.NumberFormat(state.lang==='ar'?'ar-JO':'en-US',{maximumFractionDigits:dec,minimumFractionDigits:dec}).format(n(v))}
function money(v,dec=0){return `${fmt(v,dec)} ${state.settings.currency || 'JOD'}`}
function pct(v,dec=1){return `${fmt(v,dec)}%`}
function html(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function toast(msg){const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2800)}
function emailKey(email){return String(email||'').trim().toLowerCase()}
function defaultFirstLoginPassword(){ return DEFAULT_FIRST_LOGIN_PASSWORD; }
async function createAuthUserFromAdmin(email, role){
  const cleanEmail=emailKey(email);
  const safeRole=ROLES.includes(role)?role:'partner';
  let createdUid=null;
  let authStatus='created';
  try{
    const cred = await createUserWithEmailAndPassword(authCreator, cleanEmail, defaultFirstLoginPassword());
    createdUid = cred.user.uid;
    await signOut(authCreator).catch(()=>{});
  }catch(e){
    await signOut(authCreator).catch(()=>{});
    if(e.code === 'auth/email-already-in-use'){
      authStatus='already_exists';
    }else{
      throw e;
    }
  }
  await setDoc(doc(db,'invitations',cleanEmail),{
    email:cleanEmail, role:safeRole, authStatus, mustChangePassword:true, defaultPasswordActive:authStatus==='created', createdAt:serverTimestamp(), createdBy:currentUser.email
  },{merge:true});
  if(createdUid){
    await setDoc(doc(db,'users',createdUid),{
      email:cleanEmail, role:safeRole, name:cleanEmail, authCreatedByAdmin:true, mustChangePassword:true, defaultPasswordActive:true, createdAt:serverTimestamp(), createdBy:currentUser.email
    },{merge:true});
  }
  await writeAudit(`Create Auth user ${cleanEmail} as ${safeRole} (${authStatus}) with default first password`);
  return {email:cleanEmail, role:safeRole, createdUid, authStatus};
}
function canEdit(){return WRITE_ROLES.includes(currentRole)}
function isAdmin(){return ADMIN_ONLY.includes(currentRole)}
function workspaceRef(){return doc(db, ...WORKSPACE_REF_PATH)}
function setCloudStatus(key){document.getElementById('cloudStatus').textContent=t(key)}
function snapshotForUndo(){return JSON.stringify({data:state, ts:Date.now()})}
function pushUndo(){undoStack.push(snapshotForUndo()); if(undoStack.length>8) undoStack.shift()}
function applyState(patch){state = {...state, ...patch}; render(); scheduleSave('update')}
function mutate(label, fn){ if(!canEdit()){toast(t('editBlocked')); return;} pushUndo(); fn(); state.lastUpdated = new Date().toISOString(); addAuditLocal(label); render(); scheduleSave(label); }
function addAuditLocal(action){state.audit.unshift({id:uid('a'),at:new Date().toISOString(),action,user:currentUser?.email||'demo',role:currentRole}); state.audit = state.audit.slice(0,120)}
function activeMerchants(){return state.merchants.filter(m=>m.active)}
function cycleMonthly(value,cycle){return cycle==='annual'?n(value)/12:n(value)}
function merchantGMV(m, factor=1){return n(m.monthlyOrders)*factor*n(m.aov)}
function merchantCommission(m, factor=1){return merchantGMV(m,factor)*n(m.commissionPct)/100}
function merchantBasePoints(m, factor=1){return merchantGMV(m,factor)*n(m.rewardPct)/100*n(state.settings.pointValue)}
function applicableCampaignPct(m){return state.campaigns.filter(c=>c.active && (!c.sector || c.sector===m.sector)).reduce((s,c)=>s+n(c.bonusPointsPct)*n(c.dealitSharePct||100)/100,0)}
function merchantCampaignPoints(m, factor=1){return merchantGMV(m,factor)*applicableCampaignPct(m)/100*n(state.settings.pointValue)}
function merchantSubscriptionRevenue(){return activeMerchants().reduce((s,m)=>s+cycleMonthly(m.subscription,m.subscriptionCycle),0)}
function userSubscriptionRevenue(){return state.userPlans.filter(p=>p.active).reduce((s,p)=>s+cycleMonthly(p.fee,p.cycle)*n(p.users),0)}
function itemValue(item, core){ if(!item.active) return 0; const a=n(item.amount); if(item.type==='fixed_monthly') return a; if(item.type==='one_time') return a / Math.max(1,n(state.settings.periodMonths)); if(item.type==='percent_gmv') return core.gmv*a/100; if(item.type==='percent_commission') return core.commissionRevenue*a/100; if(item.type==='per_order') return core.orders*a; return a; }
function extraRevenue(core){return state.revenues.reduce((s,r)=>s+itemValue(r,core),0)}
function calcCore(factor=1){
  const merchants=activeMerchants();
  const gmv=merchants.reduce((s,m)=>s+merchantGMV(m,factor),0);
  const orders=merchants.reduce((s,m)=>s+n(m.monthlyOrders)*factor,0);
  const commissionRevenue=merchants.reduce((s,m)=>s+merchantCommission(m,factor),0);
  const basePoints=merchants.reduce((s,m)=>s+merchantBasePoints(m,factor),0);
  const campaignPoints=merchants.reduce((s,m)=>s+merchantCampaignPoints(m,factor),0);
  const pointsIssued=basePoints+campaignPoints;
  const weightedCommission=gmv?commissionRevenue/gmv*100:0;
  const weightedReward=gmv?basePoints/gmv*100:0;
  const avgAov=orders?gmv/orders:0;
  return {gmv,orders,commissionRevenue,basePoints,campaignPoints,pointsIssued,weightedCommission,weightedReward,avgAov};
}
function scenario(key=state.activeScenario){return state.scenarios[key] || state.scenarios.acceptable}
function calcScenario(key=state.activeScenario, monthIndex=0){
  const sc=scenario(key);
  const growth=Math.pow(1+n(sc.monthlyGrowthPct)/100, monthIndex);
  const churn=Math.pow(1-n(sc.churnPct)/100, monthIndex);
  const factor=Math.max(0,growth*churn);
  const core=calcCore(factor);
  const merchantSubs=merchantSubscriptionRevenue()*factor;
  const userSubs=userSubscriptionRevenue()*factor;
  const addRev=extraRevenue(core);
  const totalRevenue=core.commissionRevenue+merchantSubs+userSubs+addRev;
  const pointLiability=(core.pointsIssued*(n(sc.redemptionRate)/100));
  const paymentFees=core.gmv*n(sc.paymentFeePct||state.settings.paymentFeePct)/100+n(state.settings.paymentGatewayMonthlyFee);
  const deliverySubsidy=core.orders*n(sc.deliverySubsidyPerOrder||0);
  const expenseItems=state.expenses.reduce((s,e)=>s+itemValue(e,core),0);
  const marketingReserve=merchantSubs*n(state.settings.marketingReservePct)/100;
  const marketingReserveExpense=state.settings.treatMarketingReserveAsExpense?marketingReserve:0;
  const variableExpenseItems=state.expenses.filter(e=>['percent_gmv','percent_commission','per_order'].includes(e.type)).reduce((s,e)=>s+itemValue(e,core),0);
  const fixedCosts=state.expenses.filter(e=>['fixed_monthly','one_time'].includes(e.type)).reduce((s,e)=>s+itemValue(e,core),0)+marketingReserveExpense+n(state.settings.paymentGatewayMonthlyFee);
  const totalCosts=pointLiability+paymentFees+deliverySubsidy+expenseItems+marketingReserveExpense;
  const netProfit=totalRevenue-totalCosts;
  const contribution=totalRevenue-pointLiability-paymentFees-deliverySubsidy-variableExpenseItems;
  const contributionMarginRatio=core.gmv?contribution/core.gmv:0;
  const breakEvenGMV=contributionMarginRatio>0?fixedCosts/contributionMarginRatio:Infinity;
  const breakEvenOrders=core.avgAov?breakEvenGMV/core.avgAov:Infinity;
  const breakEvenMerchants=core.gmv && activeMerchants().length ? breakEvenGMV/(core.gmv/activeMerchants().length):Infinity;
  const breakEvenPaidUsers = userSubs>0 ? Math.max(0,(fixedCosts-(core.commissionRevenue+merchantSubs+addRev-pointLiability-paymentFees-variableExpenseItems))/Math.max(1,userSubs/Math.max(1,state.userPlans.reduce((s,p)=>s+n(p.users),0)))) : Infinity;
  return {...core,merchantSubs,userSubs,addRev,totalRevenue,pointLiability,paymentFees,deliverySubsidy,expenseItems,marketingReserve,marketingReserveExpense,totalCosts,netProfit,contribution,contributionMarginRatio,fixedCosts,breakEvenGMV,breakEvenOrders,breakEvenMerchants,breakEvenPaidUsers,factor};
}
function forecast(key=state.activeScenario, months=n(state.settings.forecastMonths)||12){let rows=[]; for(let i=0;i<months;i++){rows.push({month:i+1,...calcScenario(key,i)})} return rows}
function sectorStats(key=state.activeScenario){
  const sc=scenario(key), out={};
  for(const m of activeMerchants()){
    const k=m.sector||'Other'; if(!out[k]) out[k]={sector:k,gmv:0,commission:0,points:0,orders:0,profit:0,weightedCommission:0};
    out[k].gmv+=merchantGMV(m); out[k].commission+=merchantCommission(m); out[k].points+=(merchantBasePoints(m)+merchantCampaignPoints(m))*n(sc.redemptionRate)/100; out[k].orders+=n(m.monthlyOrders);
  }
  return Object.values(out).map(r=>{const payment=r.gmv*n(sc.paymentFeePct||state.settings.paymentFeePct)/100; r.profit=r.commission-r.points-payment; r.weightedCommission=r.gmv?r.commission/r.gmv*100:0; return r;}).sort((a,b)=>b.gmv-a.gmv);
}
function finite(v){return Number.isFinite(Number(v));}
function moneyNA(v,dec=0){return finite(v)?money(v,dec):'N/A'}
function fmtNA(v,dec=0){return finite(v)?fmt(v,dec):'N/A'}
function pctNA(v,dec=1){return finite(v)?pct(v,dec):'N/A'}
function directExpenseItemsFor(gmv, commission, orders){
  return state.expenses.filter(e=>e.active && ['percent_gmv','percent_commission','per_order'].includes(e.type)).reduce((s,e)=>{
    if(e.type==='percent_gmv') return s + gmv*n(e.amount)/100;
    if(e.type==='percent_commission') return s + commission*n(e.amount)/100;
    if(e.type==='per_order') return s + orders*n(e.amount);
    return s;
  },0);
}
function fixedCostAllocation(gmv, calc=calcScenario()){
  return calc.gmv>0 ? calc.fixedCosts*(gmv/calc.gmv) : 0;
}
function merchantBreakEvenRows(key=state.activeScenario){
  const sc=scenario(key); const calc=calcScenario(key);
  return activeMerchants().map(m=>{
    const gmv=merchantGMV(m);
    const orders=n(m.monthlyOrders);
    const commission=merchantCommission(m);
    const sub=cycleMonthly(m.subscription,m.subscriptionCycle);
    const points=(merchantBasePoints(m)+merchantCampaignPoints(m))*n(sc.redemptionRate)/100;
    const payment=gmv*n(sc.paymentFeePct||state.settings.paymentFeePct)/100;
    const variable=directExpenseItemsFor(gmv,commission,orders);
    const contribution=commission+sub-points-payment-variable;
    const cmr=gmv>0?contribution/gmv:0;
    const allocatedFixed=fixedCostAllocation(gmv,calc);
    const breakEvenGMV=cmr>0?allocatedFixed/cmr:Infinity;
    const breakEvenOrders=n(m.aov)>0?breakEvenGMV/n(m.aov):Infinity;
    const requiredCommissionPct=gmv>0?Math.max(0,(allocatedFixed+points+payment+variable-sub)/gmv*100):Infinity;
    return {id:m.id,name:m.name,sector:m.sector,gmv,orders,avgAov:n(m.aov),commissionPct:n(m.commissionPct),contribution,cmr,allocatedFixed,breakEvenGMV,breakEvenOrders,gap:gmv-breakEvenGMV,requiredCommissionPct};
  }).sort((a,b)=>a.gap-b.gap);
}
function sectorBreakEvenRows(key=state.activeScenario){
  const calc=calcScenario(key); const map={};
  for(const r of merchantBreakEvenRows(key)){
    const k=r.sector||'Other';
    if(!map[k]) map[k]={sector:k,gmv:0,orders:0,contribution:0,allocatedFixed:0};
    map[k].gmv+=r.gmv; map[k].orders+=r.orders; map[k].contribution+=r.contribution; map[k].allocatedFixed+=r.allocatedFixed;
  }
  return Object.values(map).map(r=>{
    r.avgAov=r.orders?r.gmv/r.orders:0;
    r.cmr=r.gmv?r.contribution/r.gmv:0;
    r.breakEvenGMV=r.cmr>0?r.allocatedFixed/r.cmr:Infinity;
    r.breakEvenOrders=r.avgAov>0?r.breakEvenGMV/r.avgAov:Infinity;
    r.gap=r.gmv-r.breakEvenGMV;
    r.requiredCommissionPct=r.gmv>0?((r.allocatedFixed+(r.gmv*r.cmr<0?Math.abs(r.gmv*r.cmr):0))/r.gmv*100):Infinity;
    return r;
  }).sort((a,b)=>a.gap-b.gap);
}

function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,n(v)));}
function criterion(m,key,fallback=50){
  const v=m?.[key];
  return (v===undefined || v===null || v==='') ? fallback : clamp(v,0,100);
}
function merchantSuggestedAttractionScore(m){
  const merchants=activeMerchants();
  const maxGmv=Math.max(1,...merchants.map(x=>merchantGMV(x)));
  const maxOrders=Math.max(1,...merchants.map(x=>n(x.monthlyOrders)));
  const maxAov=Math.max(1,...merchants.map(x=>n(x.aov)));
  const maxSub=Math.max(1,...merchants.map(x=>cycleMonthly(x.subscription,x.subscriptionCycle)));
  const gmvScore=merchantGMV(m)/maxGmv*100;
  const orderScore=n(m.monthlyOrders)/maxOrders*100;
  const aovScore=n(m.aov)/maxAov*100;
  const rewardScore=clamp(n(m.rewardPct)*12,0,100);
  const capScore=clamp(n(m.redemptionCapPct),0,100);
  const subScore=cycleMonthly(m.subscription,m.subscriptionCycle)/maxSub*100;
  const marginScore=clamp(n(m.merchantMarginPct)*1.35,0,100);
  const visibilityScore=criterion(m,'visibilityScore',50);
  const offerScore=criterion(m,'offerStrengthScore',50);
  const brandScore=criterion(m,'brandPullScore',50);
  const repeatScore=criterion(m,'repeatPurchaseScore',50);
  return clamp(
    gmvScore*.18 + orderScore*.13 + aovScore*.07 + rewardScore*.11 + capScore*.11 +
    subScore*.06 + marginScore*.05 + visibilityScore*.10 + offerScore*.09 + brandScore*.06 + repeatScore*.04,
    1,100
  );
}
function merchantAttractionScore(m){
  const override=n(m.attractionOverridePct);
  if(override>0) return clamp(override,1,100);
  return merchantSuggestedAttractionScore(m);
}
function merchantAttractionRows(){
  const rows=activeMerchants().map(m=>{
    const suggested=merchantSuggestedAttractionScore(m);
    const score=merchantAttractionScore(m);
    const gmv=merchantGMV(m);
    const pointsIssued=merchantBasePoints(m)+merchantCampaignPoints(m);
    const weight=score*Math.max(1,Math.sqrt(Math.max(1,gmv)));
    return {id:m.id,name:m.name,sector:m.sector,subSector:m.subSector,suggested,score,weight,gmv,orders:n(m.monthlyOrders),aov:n(m.aov),rewardPct:n(m.rewardPct),redemptionCapPct:n(m.redemptionCapPct),subscription:cycleMonthly(m.subscription,m.subscriptionCycle),merchantMarginPct:n(m.merchantMarginPct),visibilityScore:criterion(m,'visibilityScore',50),offerStrengthScore:criterion(m,'offerStrengthScore',50),brandPullScore:criterion(m,'brandPullScore',50),repeatPurchaseScore:criterion(m,'repeatPurchaseScore',50),pointsIssued,override:n(m.attractionOverridePct)};
  });
  const totalWeight=rows.reduce((s,r)=>s+r.weight,0)||1;
  return rows.map(r=>({...r,share:r.weight/totalWeight*100})).sort((a,b)=>b.score-a.score);
}
function autoDistributionForSource(src, destinations){
  const raw=destinations.map(dst=>{
    const dest=state.merchants.find(m=>m.id===dst.id) || {};
    let affinity=1;
    if(dest.id===src.id) affinity*=1.08;
    if(dest.sector && dest.sector===src.sector) affinity*=1.12;
    if(dest.subSector && dest.subSector===src.subSector) affinity*=1.05;
    return {id:dst.id, value:Math.max(0.0001,dst.weight*affinity)};
  });
  const total=raw.reduce((sum,r)=>sum+r.value,0)||1;
  return Object.fromEntries(raw.map(r=>[r.id,(r.value/total)*100]));
}
function matrixOverrideValue(sourceId,destinationId,autoPct){
  const row=state.pointMatrixOverrides?.[sourceId];
  const val=row?.[destinationId];
  return (val===undefined || val===null || val==='') ? autoPct : clamp(val,0,100);
}
function pointRedemptionMatrix(){
  const destinations=merchantAttractionRows();
  const sources=activeMerchants();
  const redemptionRate=n(scenario().redemptionRate)/100;
  return sources.map(src=>{
    const autoDist=autoDistributionForSource(src,destinations);
    const issued=merchantBasePoints(src)+merchantCampaignPoints(src);
    const expectedRedeemed=issued*redemptionRate;
    const cells=destinations.map(dst=>{
      const distributionPct=matrixOverrideValue(src.id,dst.id,autoDist[dst.id]);
      const probability=redemptionRate*(distributionPct/100);
      return {destinationId:dst.id,destination:dst.name,distributionPct,probability,amount:expectedRedeemed*(distributionPct/100)};
    });
    const rowTotalPct=cells.reduce((sum,c)=>sum+c.distributionPct,0);
    const allocatedRedeemed=cells.reduce((sum,c)=>sum+c.amount,0);
    const breakage=issued-expectedRedeemed;
    return {sourceId:src.id,source:src.name,sector:src.sector,issued,expectedRedeemed,allocatedRedeemed,breakage,rowTotalPct,cells};
  });
}
function setSmartMatrixOverrides(){
  const destinations=merchantAttractionRows();
  state.pointMatrixOverrides={};
  activeMerchants().forEach(src=>{
    const dist=autoDistributionForSource(src,destinations);
    state.pointMatrixOverrides[src.id]={};
    destinations.forEach(dst=>state.pointMatrixOverrides[src.id][dst.id]=Number(dist[dst.id].toFixed(2)));
  });
}
function setEqualMatrixOverrides(){
  const destinations=merchantAttractionRows();
  const equal=destinations.length?100/destinations.length:0;
  state.pointMatrixOverrides={};
  activeMerchants().forEach(src=>{
    state.pointMatrixOverrides[src.id]={};
    destinations.forEach(dst=>state.pointMatrixOverrides[src.id][dst.id]=Number(equal.toFixed(2)));
  });
}
function normalizeMatrixOverrides(){
  const destinations=merchantAttractionRows();
  if(!state.pointMatrixOverrides) state.pointMatrixOverrides={};
  activeMerchants().forEach(src=>{
    if(!state.pointMatrixOverrides[src.id]){
      const dist=autoDistributionForSource(src,destinations);
      state.pointMatrixOverrides[src.id]={};
      destinations.forEach(dst=>state.pointMatrixOverrides[src.id][dst.id]=Number(dist[dst.id].toFixed(2)));
    }
    const row=state.pointMatrixOverrides[src.id];
    let sum=destinations.reduce((total,d)=>total+n(row[d.id]),0);
    if(sum<=0){
      const equal=destinations.length?100/destinations.length:0;
      destinations.forEach(d=>row[d.id]=Number(equal.toFixed(2)));
    }else{
      destinations.forEach(d=>row[d.id]=Number((n(row[d.id])*100/sum).toFixed(2)));
    }
  });
}
function tableHtml(headers, rows, wide=true){
  return `<div class="table-wrap ${wide?'wide':''}"><table><thead><tr>${headers.map(h=>`<th>${html(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td data-label="${html(headers[i]||'')}">${c??''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function reportKpiGrid(items){return `<div class="grid two">${items.map(x=>`<div class="insight-card"><strong>${html(x[0])}</strong><p>${x[1]}</p></div>`).join('')}</div>`}

function sectorOptions(){return [...new Set(state.sectors.map(s=>s.parent))].sort()}
function subSectorOptions(parent){return state.sectors.filter(s=>!parent||s.parent===parent).map(s=>s.name).sort()}
function defaultSector(parent,sub){return state.sectors.find(s=>s.parent===parent && s.name===sub) || state.sectors.find(s=>s.parent===parent) || state.sectors[0]}
function changeMerchantSector(m, parent){const d=defaultSector(parent); m.sector=parent; m.subSector=d.name; m.commissionPct=d.commissionPct; m.rewardPct=d.rewardPct; m.merchantMarginPct=d.merchantMarginPct;}
function annualizeRows(rows){return rows.reduce((a,r)=>{for(const k of ['gmv','commissionRevenue','merchantSubs','userSubs','addRev','totalRevenue','pointLiability','paymentFees','expenseItems','totalCosts','netProfit','orders']) a[k]=(a[k]||0)+n(r[k]); return a;},{});}
function plRows(calc=calcScenario()){
  return [
    ['Commission revenue',calc.commissionRevenue], ['Merchant subscription revenue',calc.merchantSubs], ['User subscription revenue',calc.userSubs], ['Other revenue',calc.addRev], ['Total revenue',calc.totalRevenue,'total'],
    ['Loyalty points expense / liability',-calc.pointLiability], ['Payment gateway fees',-calc.paymentFees], ['Delivery subsidy',-calc.deliverySubsidy], ['Expense items',-calc.expenseItems], ['Marketing reserve expense',-calc.marketingReserveExpense], ['Total costs',-calc.totalCosts,'total'], ['Net profit / loss',calc.netProfit,'final']
  ];
}
function balanceRows(calc=calcScenario()){
  return [['Merchant commission receivable',calc.commissionRevenue],['Point liability outstanding',-calc.pointLiability],['Marketing reserve',-calc.marketingReserve],['Net monthly cash impact',calc.netProfit],['Projected break-even gap',calc.gmv-calc.breakEvenGMV]];
}
function journalEntries(calc=calcScenario()){
  return [
    ['Delivered orders commission','Dr','Merchant commission receivable',calc.commissionRevenue], ['Delivered orders commission','Cr','Commission revenue',calc.commissionRevenue],
    ['Points issued','Dr','Loyalty points expense',calc.pointLiability], ['Points issued','Cr','Point liability',calc.pointLiability],
    ['Payment gateway fees','Dr','Payment gateway fees',calc.paymentFees], ['Payment gateway fees','Cr','Cash / payable',calc.paymentFees],
    ['Subscriptions','Dr','Cash / receivable',calc.merchantSubs+calc.userSubs], ['Subscriptions','Cr','Subscription revenue',calc.merchantSubs+calc.userSubs],
    ['Marketing reserve','Dr','Marketing expense / reserve allocation',calc.marketingReserve], ['Marketing reserve','Cr','Marketing reserve',calc.marketingReserve]
  ];
}

async function getUserProfile(user){
  const uref=doc(db,'users',user.uid); const snap=await getDoc(uref);
  if(snap.exists()) return snap.data();
  const email=emailKey(user.email);
  const isBootstrap=BOOTSTRAP_ADMIN_EMAILS.map(emailKey).includes(email) && !email.includes('replace_with');
  if(isBootstrap){
    const profile={email,role:'admin',name:user.displayName||email,createdAt:serverTimestamp(),bootstrap:true};
    await setDoc(uref,profile); return profile;
  }
  const inv=await getDoc(doc(db,'invitations',email));
  if(inv.exists()){
    const v=inv.data(); const profile={email,role:v.role||'partner',name:v.name||email,mustChangePassword:!!v.mustChangePassword,defaultPasswordActive:!!v.defaultPasswordActive,createdAt:serverTimestamp(),invited:true};
    await setDoc(uref,profile,{merge:true}); return profile;
  }
  return null;
}
async function ensureWorkspace(){
  const ref=workspaceRef(); const snap=await getDoc(ref);
  if(!snap.exists() && isAdmin()){
    await setDoc(ref,{data:state,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:currentUser.email});
    await writeAudit('Workspace initialized');
  }
}
async function loadWorkspace(){
  if(unsubscribeWorkspace) unsubscribeWorkspace();
  await ensureWorkspace();
  unsubscribeWorkspace = onSnapshot(workspaceRef(), snap=>{
    if(!snap.exists()) return;
    const remote=snap.data().data;
    if(remote){ state={...defaultState(),...remote,currentPage:state.currentPage||remote.currentPage||'dashboard'}; cloudDirty=false; render(); setCloudStatus('cloudSaved'); }
  }, err=>{console.error(err); setCloudStatus('cloudOffline'); toast(err.message);});
}
function scheduleSave(label='autosave'){
  if(!currentUser || !canEdit() || !state.settings.autoSave) return;
  cloudDirty=true; setCloudStatus('cloudSaving');
  clearTimeout(saveTimer); saveTimer=setTimeout(()=>saveCloud(label),900);
}
async function saveCloud(label='manual save'){
  if(!currentUser || !canEdit()) return;
  try{
    state.currentPage = state.currentPage || 'dashboard';
    await setDoc(workspaceRef(),{data:state,updatedAt:serverTimestamp(),updatedBy:currentUser.email},{merge:true});
    await writeAudit(label);
    cloudDirty=false; setCloudStatus('cloudSaved');
  }catch(e){console.error(e); setCloudStatus('cloudOffline'); toast(e.message);}
}
async function writeAudit(action){
  try{ if(currentUser) await addDoc(collection(db,'auditLogs'),{workspaceId:WORKSPACE_ID,action,email:currentUser.email,uid:currentUser.uid,role:currentRole,at:serverTimestamp()}); }catch(e){console.warn('Audit not written',e.message)}
}
async function loadInvitesAndUsers(){
  if(!isAdmin()) return;
  try{
    const usersSnap=await getDocs(collection(db,'users'));
    state.invitedUsers = usersSnap.docs.map(d=>({id:d.id, ...d.data(), source:'users'}));
    const invSnap=await getDocs(collection(db,'invitations'));
    for(const d of invSnap.docs){ if(!state.invitedUsers.find(u=>emailKey(u.email)===d.id)) state.invitedUsers.push({id:d.id,email:d.id,...d.data(),source:'invitation'}); }
  }catch(e){console.warn(e.message)}
}
async function loadRemoteAudit(){
  try{
    const q=query(collection(db,'auditLogs'),orderBy('at','desc'),limit(60));
    const snap=await getDocs(q); const rows=snap.docs.map(d=>({id:d.id,...d.data(),at:d.data().at?.toDate?.().toISOString?.() || ''}));
    if(rows.length) state.audit = rows.map(r=>({id:r.id,at:r.at,action:r.action,user:r.email,role:r.role}));
  }catch(e){console.warn(e.message)}
}

function isInvestorMode(){ return state.viewMode === 'investor' || currentRole === 'investor'; }
function visibleNavItems(){
  const hiddenForInvestor = new Set(['admin','settings','accounting','items','subscriptions']);
  return NAV.filter(([key])=>{
    if(key==='admin' && !isAdmin()) return false;
    if(isInvestorMode() && hiddenForInvestor.has(key)) return false;
    return true;
  });
}
function buildDecisionAlerts(c=calcScenario()){
  const alerts=[];
  const sc=scenario();
  const paymentPct=n(sc.paymentFeePct||state.settings.paymentFeePct);
  const dangerousCommission = c.weightedCommission < (c.weightedReward + paymentPct);
  if(dangerousCommission) alerts.push({level:'bad',title:state.lang==='ar'?'عمولة غير آمنة':'Unsafe commission',body:state.lang==='ar'?'العمولة الموزونة لا تغطي النقاط ورسوم الدفع. ارفع العمولة أو خفّض Reward %.':'Weighted commission does not cover rewards and payment fees. Increase commission or reduce reward %.',action:state.lang==='ar'?'راجع القطاعات منخفضة العمولة':'Review low-commission sectors'});
  if(c.netProfit < 0) alerts.push({level:'bad',title:state.lang==='ar'?'لسه تحت نقطة التعادل':'Below break-even',body:`${state.lang==='ar'?'الخسارة الشهرية الحالية':'Current monthly loss'} ${money(Math.abs(c.netProfit))}.`,action:state.lang==='ar'?'ارفع GMV أو قلل المصاريف الثابتة':'Increase GMV or reduce fixed costs'});
  else alerts.push({level:'good',title:state.lang==='ar'?'النموذج مربح':'Profitable model',body:`${state.lang==='ar'?'الربح الشهري المتوقع':'Expected monthly profit'} ${money(c.netProfit)}.`,action:state.lang==='ar'?'حافظ على جودة الصفقات':'Protect deal quality'});
  if(c.pointLiability > c.commissionRevenue * 0.65) alerts.push({level:'warn',title:state.lang==='ar'?'التزام النقاط مرتفع':'High point liability',body:state.lang==='ar'?'قيمة النقاط المتوقع صرفها كبيرة مقارنة بإيراد العمولة.':'Expected redeemed points are high compared with commission revenue.',action:state.lang==='ar'?'خفّض cap أو reward في المتاجر عالية المخاطر':'Reduce cap or reward in risky stores'});
  const risky=merchantHealthRows().filter(r=>r.finalScore<45).slice(0,2);
  risky.forEach(r=>alerts.push({level:'warn',title:state.lang==='ar'?'متجر يحتاج تفاوض':'Merchant needs renegotiation',body:`${html(r.name)}: ${r.recommendation}`,action:state.lang==='ar'?'ارفع العمولة أو الاشتراك':'Increase commission or subscription'}));
  if(c.gmv < c.breakEvenGMV && Number.isFinite(c.breakEvenGMV)) alerts.push({level:'warn',title:state.lang==='ar'?'فجوة GMV':'GMV gap',body:`${state.lang==='ar'?'تحتاج تقريبًا':'Need about'} ${money(c.breakEvenGMV-c.gmv)} ${state.lang==='ar'?'GMV إضافي للوصول للتعادل':'more GMV to break even'}.`,action:state.lang==='ar'?'استهدف متاجر جذبها عالي':'Target high-attraction stores'});
  return alerts.slice(0,6);
}
function merchantHealthRows(){
  const beMap=new Map(merchantBreakEvenRows().map(r=>[r.id,r]));
  const attractMap=new Map(merchantAttractionRows().map(r=>[r.id,r]));
  return activeMerchants().map(m=>{
    const be=beMap.get(m.id) || {};
    const att=attractMap.get(m.id) || {};
    const gmv=merchantGMV(m);
    const commission=merchantCommission(m);
    const points=(merchantBasePoints(m)+merchantCampaignPoints(m))*n(scenario().redemptionRate)/100;
    const pointToCommission=commission>0?points/commission*100:999;
    const attractionScore=n(att.score || merchantAttractionScore(m));
    const profitabilityScore=clamp((n(be.cmr)*100 + 5) * 4, 0, 100);
    const loyaltySafetyScore=clamp(100 - pointToCommission, 0, 100);
    const breakEvenScore=Number.isFinite(be.gap) ? clamp(50 + (be.gap/Math.max(1,gmv))*70, 0, 100) : 0;
    const riskScore=clamp(100 - ((pointToCommission>65?25:0) + (be.gap<0?30:0) + (n(m.commissionPct)<n(m.rewardPct)+n(scenario().paymentFeePct||state.settings.paymentFeePct)?25:0)), 0, 100);
    const finalScore=clamp(attractionScore*.25 + profitabilityScore*.25 + loyaltySafetyScore*.18 + breakEvenScore*.20 + riskScore*.12, 0, 100);
    let recommendation=state.lang==='ar'?'شريك ممتاز':'Excellent partner';
    if(finalScore<45) recommendation=state.lang==='ar'?'خطر: ارفع العمولة/خفّض النقاط':'Risky: raise commission/reduce rewards';
    else if(attractionScore>=70 && profitabilityScore<50) recommendation=state.lang==='ar'?'جذب عالي لكن ربحية ضعيفة':'High attraction but weak profit';
    else if(loyaltySafetyScore<45) recommendation=state.lang==='ar'?'تكلفة ولاء مرتفعة':'High loyalty cost';
    else if(breakEvenScore<50) recommendation=state.lang==='ar'?'يحتاج حجم طلبات أعلى':'Needs higher order volume';
    return {id:m.id,name:m.name,sector:m.sector,gmv,attractionScore,profitabilityScore,loyaltySafetyScore,breakEvenScore,riskScore,finalScore,recommendation,beGap:n(be.gap),requiredCommissionPct:n(be.requiredCommissionPct),currentCommissionPct:n(m.commissionPct),pointToCommission};
  }).sort((a,b)=>a.finalScore-b.finalScore);
}
function renderStoreHealth(){
  const rows=merchantHealthRows();
  const tableRows=rows.map(r=>{
    const badge=r.finalScore>=70?'good':(r.finalScore>=45?'warn':'bad');
    return [html(r.name),html(r.sector),`<span class="badge ${badge}">${pct(r.finalScore,1)}</span>`,pct(r.attractionScore,1),pct(r.profitabilityScore,1),pct(r.loyaltySafetyScore,1),pct(r.breakEvenScore,1),money(r.beGap),pct(r.currentCommissionPct,1),pct(r.requiredCommissionPct,1),html(r.recommendation)];
  });
  table('storeHealthTable',[t('name'),t('sector'),'Final score','Attraction','Profitability','Loyalty safety','Break-even','BE gap','Current comm.','Required comm.','Recommendation'],tableRows);
  const cards=document.getElementById('storeHealthCards');
  if(cards){
    cards.innerHTML=rows.slice(0,6).map(r=>{
      const badge=r.finalScore>=70?'good':(r.finalScore>=45?'warn':'bad');
      return `<div class="mobile-health-card"><div><strong>${html(r.name)}</strong><small>${html(r.sector)}</small></div><span class="badge ${badge}">${pct(r.finalScore,0)}</span><p>${html(r.recommendation)}</p><div class="mini-bars"><span style="--w:${clamp(r.attractionScore)}%">A</span><span style="--w:${clamp(r.profitabilityScore)}%">P</span><span style="--w:${clamp(r.loyaltySafetyScore)}%">L</span></div></div>`;
    }).join('');
  }
}
function renderExecutiveCockpit(c=calcScenario()){
  const el=document.getElementById('mobileCockpit'); if(!el) return;
  const health=merchantHealthRows();
  const best=health.slice().sort((a,b)=>b.finalScore-a.finalScore)[0];
  const worst=health[0];
  const gap=Number.isFinite(c.breakEvenGMV)?c.gmv-c.breakEvenGMV:0;
  el.innerHTML=`
    <div class="cockpit-head"><div><span>${state.lang==='ar'?'موبايل كوكبت':'Mobile cockpit'}</span><h3>${state.lang==='ar'?'أهم القرارات اليوم':'Today’s key decisions'}</h3></div><button class="secondary-btn" data-go-page="scenarios">${state.lang==='ar'?'جرّب What-if':'Run What-if'}</button></div>
    <div class="cockpit-grid">
      <div class="cockpit-card ${c.netProfit>=0?'good':'bad'}"><small>${state.lang==='ar'?'صافي الربح':'Net profit'}</small><strong>${money(c.netProfit)}</strong><em>${c.netProfit>=0?(state.lang==='ar'?'فوق الصفر':'positive'):(state.lang==='ar'?'يحتاج تحسين':'needs action')}</em></div>
      <div class="cockpit-card ${gap>=0?'good':'warn'}"><small>${state.lang==='ar'?'فجوة التعادل':'Break-even gap'}</small><strong>${money(gap)}</strong><em>${gap>=0?(state.lang==='ar'?'فوق التعادل':'above BE'):(state.lang==='ar'?'تحت التعادل':'below BE')}</em></div>
      <div class="cockpit-card warn"><small>${state.lang==='ar'?'التزام النقاط':'Point liability'}</small><strong>${money(c.pointLiability)}</strong><em>${pct(c.commissionRevenue?c.pointLiability/c.commissionRevenue*100:0,0)} ${state.lang==='ar'?'من العمولة':'of commission'}</em></div>
      <div class="cockpit-card"><small>${state.lang==='ar'?'أقوى متجر':'Best store'}</small><strong>${best?html(best.name):'N/A'}</strong><em>${best?pct(best.finalScore,0):''}</em></div>
      <div class="cockpit-card ${worst&&worst.finalScore<45?'bad':'warn'}"><small>${state.lang==='ar'?'أضعف متجر':'Weakest store'}</small><strong>${worst?html(worst.name):'N/A'}</strong><em>${worst?html(worst.recommendation):''}</em></div>
    </div>`;
  el.querySelectorAll('[data-go-page]').forEach(btn=>btn.onclick=()=>{state.currentPage=btn.dataset.goPage; render();});
}
function renderDecisionAlertsPanel(c=calcScenario()){
  const title=document.getElementById('decisionAlertsTitle'); if(title) title.textContent=state.lang==='ar'?'تنبيهات القرار':'Decision alerts';
  const sub=document.getElementById('decisionAlertsSub'); if(sub) sub.textContent=state.lang==='ar'?'أولويات عملية مبنية على الأرقام الحالية.':'Practical priorities based on current numbers.';
  const el=document.getElementById('decisionAlerts'); if(!el) return;
  el.innerHTML=buildDecisionAlerts(c).map(a=>`<div class="alert-card ${a.level}"><span>${a.level==='bad'?'!':a.level==='warn'?'⚠':'✓'}</span><div><strong>${html(a.title)}</strong><p>${a.body}</p><small>${html(a.action)}</small></div></div>`).join('');
}
function cloneState(){ return JSON.parse(JSON.stringify(state)); }
function calcWithTemporaryState(nextState){ const old=state; state=nextState; const result=calcScenario(old.activeScenario); state=old; return result; }
function whatIfOptions(){
  return [
    {id:'commissionUp', label:state.lang==='ar'?'ارفع كل العمولات +1%':'Increase all commissions +1%', apply:s=>s.merchants.forEach(m=>m.commissionPct=n(m.commissionPct)+1)},
    {id:'rewardDown', label:state.lang==='ar'?'خفّض كل النقاط -1%':'Reduce all rewards -1%', apply:s=>s.merchants.forEach(m=>m.rewardPct=Math.max(0,n(m.rewardPct)-1))},
    {id:'capDown', label:state.lang==='ar'?'خفّض حد الصرف -10%':'Reduce redemption cap -10%', apply:s=>s.merchants.forEach(m=>m.redemptionCapPct=Math.max(0,n(m.redemptionCapPct)-10))},
    {id:'redemptionHigh', label:state.lang==='ar'?'استخدام النقاط 90%':'Point redemption 90%', apply:s=>s.scenarios[s.activeScenario].redemptionRate=90},
    {id:'merchantSubUp', label:state.lang==='ar'?'ارفع اشتراك المتاجر +25 JOD':'Merchant subscription +25 JOD', apply:s=>s.merchants.forEach(m=>m.subscription=n(m.subscription)+25)},
    {id:'growthUp', label:state.lang==='ar'?'ارفع النمو الشهري +3%':'Monthly growth +3%', apply:s=>s.scenarios[s.activeScenario].monthlyGrowthPct=n(s.scenarios[s.activeScenario].monthlyGrowthPct)+3}
  ];
}
function applyWhatIf(id){
  const opt=whatIfOptions().find(o=>o.id===id); if(!opt) return;
  mutate(`Apply what-if ${id}`,()=>opt.apply(state));
}
function renderWhatIf(){
  const grid=document.getElementById('whatIfGrid'); if(!grid) return;
  const title=document.getElementById('whatIfTitle'); if(title) title.textContent=state.lang==='ar'?'محاكي What-if للموبايل':'Mobile What-if simulator';
  const sub=document.getElementById('whatIfSub'); if(sub) sub.textContent=state.lang==='ar'?'اختبر أثر القرار فورًا على الربح، النقاط، ونقطة التعادل.':'Instantly test impact on profit, point liability and break-even.';
  const base=calcScenario();
  grid.innerHTML=whatIfOptions().map(opt=>{
    const temp=cloneState(); opt.apply(temp); const c=calcWithTemporaryState(temp);
    const profitDelta=c.netProfit-base.netProfit; const liabilityDelta=c.pointLiability-base.pointLiability; const beDelta=c.breakEvenGMV-base.breakEvenGMV;
    return `<div class="whatif-card"><strong>${html(opt.label)}</strong><div class="whatif-metrics"><span class="${profitDelta>=0?'positive':'negative'}">Profit ${money(profitDelta)}</span><span class="${liabilityDelta<=0?'positive':'negative'}">Liability ${money(liabilityDelta)}</span><span class="${beDelta<=0?'positive':'negative'}">BE ${money(beDelta)}</span></div><button class="secondary-btn edit-only" data-apply-whatif="${opt.id}">${state.lang==='ar'?'تطبيق':'Apply'}</button></div>`;
  }).join('');
  grid.querySelectorAll('[data-apply-whatif]').forEach(btn=>btn.onclick=()=>applyWhatIf(btn.dataset.applyWhatif));
}
function mobileMatrixEditor(matrix,destinations){
  return `<div class="mobile-matrix-editor"><h3>${state.lang==='ar'?'محرر المصفوفة للموبايل':'Mobile matrix editor'}</h3>${matrix.map(row=>`<div class="mobile-matrix-card"><div class="mobile-matrix-source"><strong>${html(row.source)}</strong><small>${html(row.sector)} · ${money(row.issued,1)}</small><span class="badge ${Math.abs(row.rowTotalPct-100)<=.2?'good':'warn'}">${pct(row.rowTotalPct,1)}</span></div>${row.cells.map(c=>`<label><span>${html(c.destination)}</span><input class="cell-input matrix-pct-input" data-matrix-source="${html(row.sourceId)}" data-matrix-dest="${html(c.destinationId)}" type="number" min="0" max="100" step="0.01" value="${html(Number(c.distributionPct).toFixed(2))}"><em>${money(c.amount,1)}</em></label>`).join('')}</div>`).join('')}</div>`;
}

function render(){
  document.documentElement.lang=state.lang; document.documentElement.dir=state.lang==='ar'?'rtl':'ltr'; document.body.classList.toggle('en',state.lang==='en'); document.body.classList.toggle('investor-mode',isInvestorMode());
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  document.getElementById('langBtn').textContent=state.lang==='ar'?'English':'العربية';
  const visible=visibleNavItems(); if(!visible.find(n=>n[0]===state.currentPage)) state.currentPage='dashboard';
  document.getElementById('pageTitle').textContent=t(NAV.find(n=>n[0]===state.currentPage)?.[1]||'Dashboard');
  document.getElementById('userRolePill').textContent=`${currentUser?.email || ''} • ${currentRole}`;
  const vm=document.getElementById('viewModeSelect'); if(vm){ vm.value=isInvestorMode()?'investor':'founder'; vm.disabled=currentRole==='investor'; }
  renderNav(); renderHero(); renderPage(); applyPermissions();
}
function renderNav(){
  document.getElementById('nav').innerHTML=visibleNavItems().map(([key,label,icon])=>`<button class="${state.currentPage===key?'active':''}" data-page="${key}"><span>${t(label)}</span><span class="nav-icon">${icon}</span></button>`).join('');
  document.querySelectorAll('#nav button').forEach(btn=>btn.onclick=()=>{state.currentPage=btn.dataset.page; render(); window.scrollTo({top:0,behavior:'smooth'});});
}
function applyPermissions(){
  document.querySelectorAll('.edit-only').forEach(el=>{el.disabled=!canEdit();});
  document.querySelectorAll('.admin-only').forEach(el=>{el.disabled=!isAdmin();});
  if(!canEdit()) document.querySelectorAll('.cell-input,.cell-select').forEach(el=>{el.disabled=true;});
}
function kpi(label,value,note,cls=''){return `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></div>`}
function renderHero(){
  const c=calcScenario();
  document.getElementById('heroGrid').innerHTML = [
    kpi('GMV',money(c.gmv),`${fmt(c.orders)} ${state.lang==='ar'?'طلب/شهر':'orders/month'}`),
    kpi(state.lang==='ar'?'عمولة موزونة':'Weighted commission',pct(c.weightedCommission),`${money(c.commissionRevenue)} ${state.lang==='ar'?'إيراد عمولة':'commission revenue'}`),
    kpi(state.lang==='ar'?'التزام النقاط':'Point liability',money(c.pointLiability),`${pct(scenario().redemptionRate)} ${state.lang==='ar'?'استخدام متوقع':'expected redemption'}`),
    kpi(state.lang==='ar'?'صافي الربح':'Net profit',money(c.netProfit),`${state.lang==='ar'?'نقطة التعادل':'Break-even'} ${money(c.breakEvenGMV)}`, c.netProfit>=0?'good':'bad')
  ].join('');
}
function renderPage(){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById(`${state.currentPage}Page`); if(el) el.classList.add('active');
  const map={dashboard:renderDashboard,merchants:renderMerchants,sectors:renderSectors,subscriptions:renderSubscriptions,items:renderItems,points:renderPoints,scenarios:renderScenarios,breakeven:renderBreakeven,storeAttraction:renderStoreAttraction,pointMatrix:renderPointMatrix,accounting:renderAccounting,reports:renderReports,admin:renderAdmin,settings:renderSettings};
  map[state.currentPage]?.();
}
function renderDashboard(){
  const c=calcScenario();
  renderExecutiveCockpit(c); renderDecisionAlertsPanel(c);
  table('pulseTable',[t('metric'),t('value'),state.lang==='ar'?'ملاحظة':'Note'],[
    ['GMV',money(c.gmv),'Cash paid only'], ['Orders',fmt(c.orders),'Delivered orders basis'], ['Weighted commission',pct(c.weightedCommission),'GMV weighted'], ['Weighted reward',pct(c.weightedReward),'Base points only'], ['Campaign points',money(c.campaignPoints),'Dealit funded share'], ['Contribution margin',pct(c.contributionMarginRatio*100),'After variable costs'], ['Break-even GMV',money(c.breakEvenGMV),'Current scenario'], ['Profit / loss',money(c.netProfit),c.netProfit>=0?'Healthy':'Needs action']
  ]);
  renderDecisionRadar(c); renderStoreHealth(); renderScenarioChart(); renderBridgeChart();
  document.getElementById('goStoreAttractionBtn')?.addEventListener('click',()=>{state.currentPage='storeAttraction'; render();});
}

function renderDecisionRadar(c){
  const alerts=buildDecisionAlerts(c).slice(0,4);
  document.getElementById('decisionRadar').innerHTML=alerts.map(a=>`<div class="insight-card"><span class="badge ${a.level}">${html(a.title)}</span><p>${a.body}</p><small>${html(a.action)}</small></div>`).join('');
}
function table(id, headers, rows){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML=`<thead><tr>${headers.map(h=>`<th>${html(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td data-label="${html(headers[i]||'')}">${c??''}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function input(value,path,type='number',cls=''){ return `<input class="cell-input ${cls}" data-path="${path}" type="${type}" value="${html(value)}">`; }
function select(value,path,options){ return `<select class="cell-select" data-path="${path}">${options.map(o=>`<option value="${html(o)}" ${String(o)===String(value)?'selected':''}>${html(o)}</option>`).join('')}</select>`; }
function checkbox(value,path){ return `<select class="cell-select" data-path="${path}"><option value="true" ${value?'selected':''}>${t('yes')}</option><option value="false" ${!value?'selected':''}>${t('no')}</option></select>`; }
function bindCells(){
  document.querySelectorAll('.cell-input,.cell-select').forEach(el=>{
    el.onchange=()=>{
      const path=el.dataset.path; const raw=el.value; mutate(`Change ${path}`,()=>setByPath(path, raw));
    }
  });
  applyPermissions();
}
function setByPath(path, raw){
  const parts=path.split('.'); let obj=state;
  for(let i=0;i<parts.length-1;i++){ if(obj[parts[i]]===undefined || obj[parts[i]]===null) obj[parts[i]]={}; obj=obj[parts[i]]; }
  const key=parts.at(-1);
  let val=raw; if(raw==='true') val=true; else if(raw==='false') val=false; else if(!Number.isNaN(Number(raw)) && raw!=='' && !['name','sector','subSector','type','cycle','role','email','funding','contractStart','contractEnd','settlementCycle','fiscalStart','currency'].includes(key)) val=Number(raw);
  obj[key]=val;
  if(parts[0]==='merchants' && key==='sector'){ changeMerchantSector(obj,val); }
  if(parts[0]==='merchants' && key==='subSector'){ const d=defaultSector(obj.sector,val); obj.commissionPct=d.commissionPct; obj.rewardPct=d.rewardPct; obj.merchantMarginPct=d.merchantMarginPct; }
}
function delButton(action,id){return `<button class="danger-btn edit-only" data-del="${action}" data-id="${id}">${t('delete')}</button>`}
function bindDelete(){
  document.querySelectorAll('[data-del]').forEach(btn=>btn.onclick=()=>mutate(`Delete ${btn.dataset.del}`,()=>{const arr=state[btn.dataset.del]; const idx=arr.findIndex(x=>x.id===btn.dataset.id); if(idx>=0) arr.splice(idx,1);}));
}
function renderMerchants(){
  const rows=state.merchants.map((m,i)=>[
    input(m.name,`merchants.${i}.name`,'text'), select(m.sector,`merchants.${i}.sector`,sectorOptions()), select(m.subSector,`merchants.${i}.subSector`,subSectorOptions(m.sector)), input(m.monthlyOrders,`merchants.${i}.monthlyOrders`), input(m.aov,`merchants.${i}.aov`), input(m.commissionPct,`merchants.${i}.commissionPct`), input(m.rewardPct,`merchants.${i}.rewardPct`), input(m.redemptionCapPct,`merchants.${i}.redemptionCapPct`), input(m.subscription,`merchants.${i}.subscription`), select(m.subscriptionCycle,`merchants.${i}.subscriptionCycle`,['monthly','annual']), input(m.merchantMarginPct,`merchants.${i}.merchantMarginPct`), input(m.contractStart,`merchants.${i}.contractStart`,'date','date'), input(m.contractEnd,`merchants.${i}.contractEnd`,'date','date'), select(m.settlementCycle,`merchants.${i}.settlementCycle`,['weekly','monthly']), checkbox(m.active,`merchants.${i}.active`), money(merchantGMV(m)), money(merchantCommission(m)), delButton('merchants',m.id)
  ]);
  table('merchantsTable',[t('name'),t('sector'),t('subSector'),t('orders'),t('aov'),t('commission'),t('reward'),t('cap'),t('subscription'),'Cycle',t('margin'),'Start','End','Settlement',t('active'),t('gmv'),'Commission',t('action')],rows); bindCells(); bindDelete();
  document.getElementById('addMerchantBtn').onclick=()=>mutate('Add merchant',()=>{const d=state.sectors[0]; state.merchants.push({id:uid('m'),name:'New merchant',sector:d.parent,subSector:d.name,monthlyOrders:0,aov:0,commissionPct:d.commissionPct,rewardPct:d.rewardPct,redemptionCapPct:n(state.settings.generalRedemptionCapPct),subscription:0,subscriptionCycle:'monthly',merchantMarginPct:d.merchantMarginPct,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true});});
}
function renderSectors(){
  const rows=state.sectors.map((s,i)=>[input(s.parent,`sectors.${i}.parent`,'text'),input(s.name,`sectors.${i}.name`,'text'),input(s.commissionPct,`sectors.${i}.commissionPct`),input(s.rewardPct,`sectors.${i}.rewardPct`),input(s.merchantMarginPct,`sectors.${i}.merchantMarginPct`),checkbox(s.active,`sectors.${i}.active`),delButton('sectors',s.id)]);
  table('sectorsTable',[state.lang==='ar'?'قطاع رئيسي':'Parent sector',t('subSector'),t('commission'),t('reward'),t('margin'),t('active'),t('action')],rows); bindCells(); bindDelete();
  document.getElementById('addSectorBtn').onclick=()=>mutate('Add sector',()=>state.sectors.push({id:uid('sec'),parent:'New sector',name:'New sub-sector',commissionPct:10,rewardPct:3,merchantMarginPct:30,active:true}));
  document.getElementById('resetSectorsBtn').onclick=()=>mutate('Reset sectors',()=>state.sectors=JSON.parse(JSON.stringify(DEFAULT_SECTORS)));
}
function renderSubscriptions(){
  const mp=state.merchantPlans.map((p,i)=>[input(p.name,`merchantPlans.${i}.name`,'text'),input(p.fee,`merchantPlans.${i}.fee`),select(p.cycle,`merchantPlans.${i}.cycle`,['monthly','annual']),input(p.pushWeight,`merchantPlans.${i}.pushWeight`),input(p.marketingReservePct,`merchantPlans.${i}.marketingReservePct`),checkbox(p.active,`merchantPlans.${i}.active`),delButton('merchantPlans',p.id)]);
  const up=state.userPlans.map((p,i)=>[input(p.name,`userPlans.${i}.name`,'text'),input(p.fee,`userPlans.${i}.fee`),select(p.cycle,`userPlans.${i}.cycle`,['monthly','annual']),input(p.users,`userPlans.${i}.users`),input(p.redemptionCapPct,`userPlans.${i}.redemptionCapPct`),input(p.pointsBoostPct,`userPlans.${i}.pointsBoostPct`),input(p.deliveryDiscountPct,`userPlans.${i}.deliveryDiscountPct`),checkbox(p.active,`userPlans.${i}.active`),delButton('userPlans',p.id)]);
  table('merchantPlansTable',[t('name'),t('amount'),'Cycle','Push weight','Marketing %',t('active'),t('action')],mp); table('userPlansTable',[t('name'),t('amount'),'Cycle','Users',t('cap'),'Points boost %','Delivery discount %',t('active'),t('action')],up); bindCells(); bindDelete();
  document.getElementById('addMerchantPlanBtn').onclick=()=>mutate('Add merchant plan',()=>state.merchantPlans.push({id:uid('mp'),name:'New plan',fee:0,cycle:'monthly',pushWeight:1,marketingReservePct:20,active:true}));
  document.getElementById('addUserPlanBtn').onclick=()=>mutate('Add user plan',()=>state.userPlans.push({id:uid('up'),name:'New plan',fee:0,cycle:'monthly',users:0,redemptionCapPct:50,pointsBoostPct:0,deliveryDiscountPct:0,active:true}));
}
function renderItems(){
  const opts=['fixed_monthly','one_time','percent_gmv','percent_commission','per_order'];
  const r=state.revenues.map((x,i)=>[input(x.name,`revenues.${i}.name`,'text'),select(x.type,`revenues.${i}.type`,opts),input(x.amount,`revenues.${i}.amount`),money(itemValue(x,calcScenario())),checkbox(x.active,`revenues.${i}.active`),delButton('revenues',x.id)]);
  const e=state.expenses.map((x,i)=>[input(x.name,`expenses.${i}.name`,'text'),select(x.type,`expenses.${i}.type`,opts),input(x.amount,`expenses.${i}.amount`),money(itemValue(x,calcScenario())),checkbox(x.active,`expenses.${i}.active`),delButton('expenses',x.id)]);
  table('revenueTable',[t('name'),t('type'),t('amount'),state.lang==='ar'?'شهريًا':'Monthly value',t('active'),t('action')],r); table('expenseTable',[t('name'),t('type'),t('amount'),state.lang==='ar'?'شهريًا':'Monthly value',t('active'),t('action')],e); bindCells(); bindDelete();
  document.getElementById('addRevenueBtn').onclick=()=>mutate('Add revenue',()=>state.revenues.push({id:uid('r'),name:'New revenue',type:'fixed_monthly',amount:0,active:true}));
  document.getElementById('addExpenseBtn').onclick=()=>mutate('Add expense',()=>state.expenses.push({id:uid('e'),name:'New expense',type:'fixed_monthly',amount:0,active:true}));
}
function renderPoints(){
  const c=calcScenario();
  document.getElementById('pointsSettings').innerHTML=[
    field('Point value',input(state.settings.pointValue,'settings.pointValue')), field('Expiry months',input(state.settings.pointExpiryMonths,'settings.pointExpiryMonths')), field('General redemption cap %',input(state.settings.generalRedemptionCapPct,'settings.generalRedemptionCapPct')), field('Expected redemption %',input(scenario().redemptionRate,`scenarios.${state.activeScenario}.redemptionRate`)), field('Breakage %',input(scenario().breakageRate,`scenarios.${state.activeScenario}.breakageRate`)), field('Bonus points %',input(scenario().bonusPointsPct,`scenarios.${state.activeScenario}.bonusPointsPct`))
  ].join('');
  bindCells();
  document.getElementById('pointsInsight').innerHTML=[
    `<div class="insight-card"><span class="badge good">Base points</span><strong>${money(c.basePoints)}</strong><p>Reward % from merchants on cash-paid GMV.</p></div>`,
    `<div class="insight-card"><span class="badge warn">Campaign points</span><strong>${money(c.campaignPoints)}</strong><p>Dealit-funded share from active campaigns.</p></div>`,
    `<div class="insight-card"><span class="badge bad">Expected liability</span><strong>${money(c.pointLiability)}</strong><p>Issued points × expected redemption rate. Expiry: ${fmt(state.settings.pointExpiryMonths)} months.</p></div>`
  ].join('');
  const rows=state.campaigns.map((x,i)=>[input(x.name,`campaigns.${i}.name`,'text'),select(x.sector,`campaigns.${i}.sector`,['',...sectorOptions()]),input(x.bonusPointsPct,`campaigns.${i}.bonusPointsPct`),select(x.funding,`campaigns.${i}.funding`,['dealit','merchant','shared']),input(x.dealitSharePct,`campaigns.${i}.dealitSharePct`),input(x.monthlyBudget,`campaigns.${i}.monthlyBudget`),checkbox(x.active,`campaigns.${i}.active`),delButton('campaigns',x.id)]);
  table('campaignsTable',[t('name'),t('sector'),'Bonus points %','Funding','Dealit share %','Budget',t('active'),t('action')],rows); bindCells(); bindDelete();
  document.getElementById('addCampaignBtn').onclick=()=>mutate('Add campaign',()=>state.campaigns.push({id:uid('c'),name:'New campaign',sector:'',bonusPointsPct:0,funding:'dealit',dealitSharePct:100,monthlyBudget:0,active:true}));
}
function field(label,control){return `<div class="field"><label>${html(label)}</label>${control}</div>`}
function renderScenarios(){
  renderWhatIf();
  const rows=SCENARIO_KEYS.map(k=>{const s=state.scenarios[k]; const calc=calcScenario(k); return [k,input(s.name,`scenarios.${k}.name`,'text'),input(s.redemptionRate,`scenarios.${k}.redemptionRate`),input(s.breakageRate,`scenarios.${k}.breakageRate`),input(s.monthlyGrowthPct,`scenarios.${k}.monthlyGrowthPct`),input(s.churnPct,`scenarios.${k}.churnPct`),input(s.bonusPointsPct,`scenarios.${k}.bonusPointsPct`),input(s.paymentFeePct,`scenarios.${k}.paymentFeePct`),input(s.deliverySubsidyPerOrder,`scenarios.${k}.deliverySubsidyPerOrder`),money(calc.netProfit),money(calc.breakEvenGMV),`<button class="secondary-btn" data-scenario="${k}">${state.activeScenario===k?'✓ ':''}${state.lang==='ar'?'تفعيل':'Activate'}</button>`]});
  table('scenariosTable',['Key',t('name'),'Redemption %','Breakage %','Growth %','Churn %','Bonus %','Payment %','Delivery subsidy','Profit','BE GMV',t('action')],rows); bindCells(); document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>{state.activeScenario=b.dataset.scenario; render(); scheduleSave('Active scenario')});
}
function renderBreakeven(){
  const c=calcScenario();
  const appRows=[
    ['App Break-even GMV',moneyNA(c.breakEvenGMV),'Total application target'],
    ['App Break-even orders',fmtNA(c.breakEvenOrders),'Based on current weighted AOV'],
    ['App Break-even merchants',fmtNA(c.breakEvenMerchants,1),'Based on average GMV per active merchant'],
    ['Required weighted commission',pctNA(((c.fixedCosts+c.pointLiability+c.paymentFees+c.expenseItems)/Math.max(1,c.gmv))*100),'Rough target to cover costs'],
    ['Current weighted commission',pctNA(c.weightedCommission),'Actual model'],
    ['Break-even gap',moneyNA(c.gmv-c.breakEvenGMV),c.gmv>=c.breakEvenGMV?'Above break-even':'Below break-even']
  ];
  table('breakevenTable',[t('metric'),t('value'),state.lang==='ar'?'تفسير':'Interpretation'],appRows);

  const sectorRows=sectorBreakEvenRows().map(r=>[
    r.sector, moneyNA(r.gmv), pctNA(r.cmr*100), moneyNA(r.allocatedFixed), moneyNA(r.breakEvenGMV), fmtNA(r.breakEvenOrders), moneyNA(r.gap)
  ]);
  table('sectorBreakEvenTable',[t('sector'),t('gmv'),'Contribution margin %','Allocated fixed cost','Break-even GMV','Break-even orders','Gap'],sectorRows);

  const merchantRows=merchantBreakEvenRows().map(r=>[
    r.name, r.sector, moneyNA(r.gmv), pctNA(r.cmr*100), moneyNA(r.allocatedFixed), moneyNA(r.breakEvenGMV), fmtNA(r.breakEvenOrders), pctNA(r.requiredCommissionPct), moneyNA(r.gap)
  ]);
  table('merchantBreakEvenTable',[t('name'),t('sector'),t('gmv'),'Contribution margin %','Allocated fixed cost','Break-even GMV','Break-even orders','Required commission %','Gap'],merchantRows);

  renderSectorChart();
}

function renderStoreAttraction(){
  const rows=merchantAttractionRows();
  const merchantIndex = new Map(state.merchants.map((m,i)=>[m.id,i]));
  const tableRows=rows.map(r=>{
    const i=merchantIndex.get(r.id);
    const m=state.merchants[i]||{};
    const badgeClass=r.score>=70?'good':(r.score>=40?'warn':'bad');
    const finalValue=r.override>0?r.override.toFixed(1):r.suggested.toFixed(1);
    return [
      input(m.name||r.name,`merchants.${i}.name`,'text'),
      select(m.sector||r.sector,`merchants.${i}.sector`,sectorOptions()),
      select(m.subSector||r.subSector,`merchants.${i}.subSector`,subSectorOptions(m.sector||r.sector)),
      input(m.monthlyOrders??r.orders,`merchants.${i}.monthlyOrders`),
      input(m.aov??r.aov,`merchants.${i}.aov`),
      money(r.gmv),
      input(m.rewardPct??r.rewardPct,`merchants.${i}.rewardPct`),
      input(m.redemptionCapPct??r.redemptionCapPct,`merchants.${i}.redemptionCapPct`),
      input(m.subscription??r.subscription,`merchants.${i}.subscription`),
      input(m.merchantMarginPct??r.merchantMarginPct,`merchants.${i}.merchantMarginPct`),
      input(m.visibilityScore??r.visibilityScore,`merchants.${i}.visibilityScore`),
      input(m.offerStrengthScore??r.offerStrengthScore,`merchants.${i}.offerStrengthScore`),
      input(m.brandPullScore??r.brandPullScore,`merchants.${i}.brandPullScore`),
      input(m.repeatPurchaseScore??r.repeatPurchaseScore,`merchants.${i}.repeatPurchaseScore`),
      `<span class="badge ${badgeClass}">${pct(r.suggested,1)}</span>`,
      input(finalValue,`merchants.${i}.attractionOverridePct`),
      pct(r.share,1)
    ];
  });
  table('storeAttractionTable',[t('name'),t('sector'),t('subSector'),t('orders'),t('aov'),t('gmv'),t('reward'),t('cap'),'Subscription','Margin %','Visibility','Offer strength','Brand pull','Repeat purchase','Suggested score','Final score %','Redemption share'],tableRows);
  bindCells();
  const top=rows[0]; const low=rows.at(-1);
  document.getElementById('storeAttractionInsight').innerHTML=[
    `<div class="panel-head"><div><h3>${state.lang==='ar'?'قراءة قوة الجذب':'Attraction interpretation'}</h3><p>${state.lang==='ar'?'كل الخانات قابلة للتعديل. النظام يأخذ بيانات الطلبات، متوسط السلة، النقاط، حد الصرف، الاشتراك، الهامش، الظهور داخل التطبيق، قوة العرض، قوة البراند، وتكرار الشراء ليقترح Score. خانة Final score تعدّل النتيجة النهائية يدويًا.':'All fields are editable. The system uses orders, AOV, reward %, cap, subscription, margin, in-app visibility, offer strength, brand pull and repeat purchase to suggest a score. Final score can override it manually.'}</p></div></div>`,
    top?`<div class="insight-card"><span class="badge good">${state.lang==='ar'?'أعلى جذب':'Highest pull'}</span><strong>${html(top.name)}</strong><p>${pct(top.score,1)} final score / ${pct(top.share,1)} expected redemption share.</p></div>`:'',
    low?`<div class="insight-card"><span class="badge warn">${state.lang==='ar'?'أضعف جذب':'Lowest pull'}</span><strong>${html(low.name)}</strong><p>${state.lang==='ar'?'ارفع العرض أو حد الصرف أو الظهور داخل التطبيق إذا كان استراتيجيًا.':'Improve offers, redemption cap or in-app visibility if strategically important.'}</p></div>`:'',
    `<div class="insight-card"><strong>${state.lang==='ar'?'معادلة الاقتراح':'Suggestion formula'}</strong><p>GMV 18% · Orders 13% · AOV 7% · Reward 11% · Cap 11% · Subscription 6% · Margin 5% · Visibility 10% · Offer 9% · Brand 6% · Repeat 4%</p></div>`
  ].join('');
  renderAttractionChart(rows);
}

function matrixCellInput(sourceId,destinationId,value,amount){
  return `<div class="matrix-cell editable-matrix"><label><input class="cell-input matrix-pct-input" data-matrix-source="${html(sourceId)}" data-matrix-dest="${html(destinationId)}" type="number" min="0" max="100" step="0.01" value="${html(Number(value).toFixed(2))}"><span>%</span></label><small>${money(amount,1)}</small></div>`;
}
function bindMatrixCells(){
  document.querySelectorAll('.matrix-pct-input').forEach(el=>{
    el.onchange=()=>mutate('Change point matrix probability',()=>{
      const src=el.dataset.matrixSource; const dst=el.dataset.matrixDest;
      if(!state.pointMatrixOverrides) state.pointMatrixOverrides={};
      if(!state.pointMatrixOverrides[src]) state.pointMatrixOverrides[src]={};
      state.pointMatrixOverrides[src][dst]=clamp(el.value,0,100);
    });
  });
  document.getElementById('smartMatrixBtn')?.addEventListener('click',()=>mutate('Smart point matrix calculation',()=>setSmartMatrixOverrides()));
  document.getElementById('equalMatrixBtn')?.addEventListener('click',()=>mutate('Equal point matrix distribution',()=>setEqualMatrixOverrides()));
  document.getElementById('normalizeMatrixBtn')?.addEventListener('click',()=>mutate('Normalize point matrix rows',()=>normalizeMatrixOverrides()));
  applyPermissions();
}
function renderPointMatrix(){
  const destinations=merchantAttractionRows();
  const matrix=pointRedemptionMatrix();
  const headers=[state.lang==='ar'?'النقاط المكتسبة من \\ الصرف في':'Earned at \\ Redeemed at',...destinations.map(d=>d.name),state.lang==='ar'?'مجموع الصف':'Row total','Expected redeemed','Breakage / unredeemed'];
  const rows=matrix.map(row=>{
    const totalClass=Math.abs(row.rowTotalPct-100)<=0.2?'good':'warn';
    return [
      `<strong>${html(row.source)}</strong><br><small>${html(row.sector)} · ${money(row.issued,1)} issued</small>`,
      ...row.cells.map(c=>matrixCellInput(row.sourceId,c.destinationId,c.distributionPct,c.amount)),
      `<span class="badge ${totalClass}">${pct(row.rowTotalPct,2)}</span>`,
      money(row.expectedRedeemed,1), money(row.breakage,1)
    ];
  });
  table('pointMatrixTable',headers,rows);
  const totals=destinations.map((d,idx)=>matrix.reduce((sum,row)=>sum+row.cells[idx].amount,0));
  const topIdx=totals.indexOf(Math.max(...totals,0));
  const totalIssued=matrix.reduce((sum,r)=>sum+r.issued,0);
  const totalRedeemed=matrix.reduce((sum,r)=>sum+r.expectedRedeemed,0);
  const badRows=matrix.filter(r=>Math.abs(r.rowTotalPct-100)>.2).length;
  document.getElementById('pointMatrixInsight').innerHTML=[
    `<div class="panel-head"><div><h3>${state.lang==='ar'?'قراءة المصفوفة':'Matrix interpretation'}</h3><p>${state.lang==='ar'?'كل صف يوزّع 100% من النقاط المتوقع صرفها من متجر معيّن على المتاجر المستقبلة. الخلية تعرض نسبة التوزيع والقيمة المتوقعة بالدينار.':'Each row distributes 100% of expected redeemed points from a source merchant across destination stores. Each cell shows distribution % and expected JOD value.'}</p></div></div>`,
    `<div class="button-row matrix-actions edit-only"><button class="primary-btn" id="smartMatrixBtn">${state.lang==='ar'?'احسب احتمالات ذكيًا':'Smart calculation'}</button><button class="secondary-btn" id="equalMatrixBtn">${state.lang==='ar'?'توزيع بالتساوي':'Equal split'}</button><button class="secondary-btn" id="normalizeMatrixBtn">${state.lang==='ar'?'تعديل الصفوف إلى 100%':'Normalize rows to 100%'}</button></div>`,
    reportKpiGrid([
      [state.lang==='ar'?'إجمالي النقاط الصادرة':'Total issued points', money(totalIssued,1)],
      [state.lang==='ar'?'إجمالي الصرف المتوقع':'Expected redeemed', money(totalRedeemed,1)],
      [state.lang==='ar'?'متجر الصرف الأقوى':'Strongest redemption destination', destinations[topIdx]?html(destinations[topIdx].name):'N/A'],
      [state.lang==='ar'?'صفوف تحتاج تعديل':'Rows needing normalization', fmt(badRows)]
    ]),
    mobileMatrixEditor(matrix,destinations)
  ].join('');
  bindMatrixCells();
}
function renderAttractionChart(rows=merchantAttractionRows()){
  const ctx=document.getElementById('attractionChart'); if(!ctx || !window.Chart) return;
  const topRows=rows.slice(0,8); if(charts.attraction) charts.attraction.destroy();
  charts.attraction=new Chart(ctx,{type:'bar',data:{labels:topRows.map(r=>r.name),datasets:[{label:'Attraction score',data:topRows.map(r=>r.score)}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8ea3bf'}},y:{ticks:{color:'#8ea3bf'},min:0,max:100}}}});
}

function renderAccounting(){
  table('plTable',[t('metric'),t('value')],plRows().map(r=>[r[2]?`<strong>${html(r[0])}</strong>`:html(r[0]),`<span class="${r[1]>=0?'positive':'negative'}">${money(r[1])}</span>`]));
  table('balanceTable',[t('metric'),t('value')],balanceRows().map(r=>[r[0],`<span class="${r[1]>=0?'positive':'negative'}">${money(r[1])}</span>`]));
  table('journalTable',['Memo','Dr/Cr','Account',t('amount')],journalEntries().map(r=>[r[0],r[1],r[2],money(r[3])]));
  table('accountsTable',['Code',t('name'),'Class',t('type')],state.accounts.map(a=>[a.id,a.name,a.class,a.type]));
}
function renderReports(){
  const tabs=[
    ['summary',state.lang==='ar'?'ملخص إداري':'Summary'],
    ['breakeven',state.lang==='ar'?'نقطة التعادل':'Break-even'],
    ['pl',state.lang==='ar'?'الربح والخسارة':'P&L'],
    ['cashflow',state.lang==='ar'?'التدفق النقدي':'Cash flow'],
    ['points',state.lang==='ar'?'النقاط':'Points'],
    ['attraction',state.lang==='ar'?'قوة جذب المتجر':'Store attraction'],
    ['matrix',state.lang==='ar'?'مصفوفة الصرف':'Point matrix'],
    ['sectors',state.lang==='ar'?'القطاعات':'Sectors'],
    ['merchants',state.lang==='ar'?'المتاجر':'Merchants']
  ];
  if(!tabs.find(x=>x[0]===state.activeReportTab)) state.activeReportTab='summary';
  const tabButtons=`<div class="report-tabs">${tabs.map(([id,label])=>`<button class="${state.activeReportTab===id?'active':''}" data-report-tab="${id}">${html(label)}</button>`).join('')}</div>`;
  document.getElementById('reportSummary').innerHTML=`<div class="panel-head"><div><h3>${state.lang==='ar'?'تقارير مفصلة':'Detailed reports'}</h3><p>${state.lang==='ar'?'كل تاب يعطيك تقريرًا منفصلًا قابلًا للطباعة والتصدير.':'Each tab gives a separate report ready for printing and export.'}</p></div></div>${tabButtons}<div id="reportTabContent">${renderReportTab(state.activeReportTab)}</div>`;
  document.querySelectorAll('[data-report-tab]').forEach(btn=>btn.onclick=()=>{state.activeReportTab=btn.dataset.reportTab; renderReports();});
}
function renderReportTab(tab){
  const c=calcScenario();
  if(tab==='summary'){
    const annual=annualizeRows(forecast(state.activeScenario,12));
    return reportKpiGrid([
      ['Monthly profit', money(c.netProfit)], ['12M projected profit', money(annual.netProfit)], ['Point liability', money(c.pointLiability)], ['Break-even GMV', money(c.breakEvenGMV)], ['Weighted commission', pct(c.weightedCommission)], ['Contribution margin', pct(c.contributionMarginRatio*100)], ['Orders / month', fmt(c.orders)], ['Active merchants', fmt(activeMerchants().length)]
    ]) + tableHtml([t('metric'),t('value')],[
      ['GMV',money(c.gmv)],['Commission revenue',money(c.commissionRevenue)],['Merchant subscriptions',money(c.merchantSubs)],['User subscriptions',money(c.userSubs)],['Other revenue',money(c.addRev)],['Total costs',money(c.totalCosts)],['Net profit',money(c.netProfit)]
    ],false);
  }
  if(tab==='breakeven'){
    const appRows=[
      ['App Break-even GMV',moneyNA(c.breakEvenGMV),'Full application'],['App Break-even orders',fmtNA(c.breakEvenOrders),'Current weighted AOV'],['App Break-even merchants',fmtNA(c.breakEvenMerchants,1),'Average GMV per merchant'],['Required weighted commission',pctNA(((c.fixedCosts+c.pointLiability+c.paymentFees+c.expenseItems)/Math.max(1,c.gmv))*100),'Cost coverage rough target'],['Current weighted commission',pctNA(c.weightedCommission),'Actual'],['Break-even gap',moneyNA(c.gmv-c.breakEvenGMV),c.gmv>=c.breakEvenGMV?'Above':'Below']
    ];
    const sectorRows=sectorBreakEvenRows().map(r=>[r.sector,moneyNA(r.gmv),pctNA(r.cmr*100),moneyNA(r.allocatedFixed),moneyNA(r.breakEvenGMV),fmtNA(r.breakEvenOrders),moneyNA(r.gap)]);
    const merchantRows=merchantBreakEvenRows().map(r=>[r.name,r.sector,moneyNA(r.gmv),pctNA(r.cmr*100),moneyNA(r.allocatedFixed),moneyNA(r.breakEvenGMV),fmtNA(r.breakEvenOrders),pctNA(r.requiredCommissionPct),moneyNA(r.gap)]);
    return `<h3>${state.lang==='ar'?'نقطة التعادل للتطبيق كاملًا':'App break-even'}</h3>`+tableHtml([t('metric'),t('value'),'Interpretation'],appRows,false)+`<h3>${state.lang==='ar'?'نقطة التعادل لكل قطاع':'Sector break-even'}</h3>`+tableHtml([t('sector'),t('gmv'),'CM %','Allocated fixed','BE GMV','BE orders','Gap'],sectorRows)+`<h3>${state.lang==='ar'?'نقطة التعادل لكل متجر':'Merchant break-even'}</h3>`+tableHtml([t('name'),t('sector'),t('gmv'),'CM %','Allocated fixed','BE GMV','BE orders','Required commission %','Gap'],merchantRows);
  }
  if(tab==='pl'){
    return `<h3>P&L</h3>`+tableHtml([t('metric'),t('value')],plRows().map(r=>[r[2]?`<strong>${html(r[0])}</strong>`:html(r[0]),`<span class="${r[1]>=0?'positive':'negative'}">${money(r[1])}</span>`]),false)+`<h3>${state.lang==='ar'?'عرض الميزانية':'Balance-style view'}</h3>`+tableHtml([t('metric'),t('value')],balanceRows().map(r=>[r[0],`<span class="${r[1]>=0?'positive':'negative'}">${money(r[1])}</span>`]),false)+`<h3>${state.lang==='ar'?'القيود اليومية':'Journal entries'}</h3>`+tableHtml(['Memo','Dr/Cr','Account',t('amount')],journalEntries().map(r=>[r[0],r[1],r[2],money(r[3])]));
  }
  if(tab==='cashflow'){
    const rows=forecast(state.activeScenario,n(state.settings.forecastMonths)||24).map(r=>[r.month,money(r.gmv),money(r.totalRevenue),money(r.pointLiability),money(r.paymentFees),money(r.totalCosts),money(r.netProfit),money(r.breakEvenGMV)]);
    return tableHtml(['Month','GMV','Revenue','Point liability','Payment fees','Total costs','Net profit','BE GMV'],rows);
  }
  if(tab==='points'){
    const rows=activeMerchants().map(m=>[m.name,m.sector,money(merchantBasePoints(m),1),money(merchantCampaignPoints(m),1),money((merchantBasePoints(m)+merchantCampaignPoints(m))*n(scenario().redemptionRate)/100,1),pct(n(m.redemptionCapPct),1)]);
    return reportKpiGrid([['Points issued',money(c.pointsIssued,1)],['Expected redeemed liability',money(c.pointLiability,1)],['Expected breakage',money(c.pointsIssued-c.pointLiability,1)],['Expiry period',`${fmt(state.settings.pointExpiryMonths)} months`]]) + tableHtml([t('name'),t('sector'),'Base points','Campaign points','Expected liability','Cap %'],rows);
  }
  if(tab==='attraction'){
    return tableHtml([t('name'),t('sector'),'Suggested score','Final score','Redemption share',t('gmv'),t('orders'),t('aov'),t('reward'),t('cap'),'Visibility','Offer','Brand','Repeat'],merchantAttractionRows().map(r=>[r.name,r.sector,pct(r.suggested,1),pct(r.score,1),pct(r.share,1),money(r.gmv),fmt(r.orders),money(r.aov,1),pct(r.rewardPct),pct(r.redemptionCapPct),pct(r.visibilityScore),pct(r.offerStrengthScore),pct(r.brandPullScore),pct(r.repeatPurchaseScore)]));
  }
  if(tab==='matrix'){
    const destinations=merchantAttractionRows(); const matrix=pointRedemptionMatrix();
    const headers=[state.lang==='ar'?'من / إلى':'From / To',...destinations.map(d=>d.name),state.lang==='ar'?'مجموع الصف':'Row total','Expected redeemed','Breakage'];
    const rows=matrix.map(row=>[row.source,...row.cells.map(c=>`${pct(c.distributionPct,1)} / ${money(c.amount,1)}`),pct(row.rowTotalPct,1),money(row.expectedRedeemed,1),money(row.breakage,1)]);
    return tableHtml(headers,rows);
  }
  if(tab==='sectors'){
    return tableHtml([t('sector'),t('gmv'),'Commission','Points','Orders','Profit','Weighted commission'],sectorStats().map(r=>[r.sector,money(r.gmv),money(r.commission),money(r.points),fmt(r.orders),money(r.profit),pct(r.weightedCommission)]));
  }
  if(tab==='merchants'){
    return tableHtml([t('name'),t('sector'),t('subSector'),t('orders'),t('aov'),t('commission'),t('reward'),t('gmv'),'Commission revenue','Attraction score'],activeMerchants().map(m=>[m.name,m.sector,m.subSector,fmt(n(m.monthlyOrders)),money(n(m.aov),1),pct(n(m.commissionPct)),pct(n(m.rewardPct)),money(merchantGMV(m)),money(merchantCommission(m)),pct(merchantAttractionScore(m),1)]));
  }
  return '';
}

async function resetAdminUserPassword(userLike){
  if(!isAdmin()){toast(t('needAdmin'));return;}
  const email=emailKey(userLike.email||userLike.id);
  const uid=userLike.source==='users' ? userLike.id : (userLike.uid||'');
  if(!email){toast('Missing email');return;}
  try{
    if(uid){
      await setDoc(doc(db,'users',uid),{
        email,
        mustChangePassword:true,
        defaultPasswordActive:false,
        passwordResetRequestedAt:serverTimestamp(),
        passwordResetRequestedBy:currentUser.email
      },{merge:true});
    }
    await setDoc(doc(db,'invitations',email),{
      email,
      role:userLike.role||'partner',
      mustChangePassword:true,
      defaultPasswordActive:false,
      passwordResetRequestedAt:serverTimestamp(),
      passwordResetRequestedBy:currentUser.email
    },{merge:true});
    await sendPasswordResetEmail(auth,email);
    await writeAudit(`Send password reset ${email}`);
    toast(state.lang==='ar'?'تم إرسال رابط إعادة تعيين كلمة المرور وتفعيل طلب التغيير':'Password reset email sent and change request enabled');
    await renderAdmin();
  }catch(e){console.error(e); toast(e.message || 'Password reset failed');}
}
function bindAdminReset(){
  document.querySelectorAll('[data-user-reset]').forEach(btn=>{
    btn.onclick=async()=>{
      const key=btn.dataset.userReset;
      const user=(state.invitedUsers||[]).find(u=>String(u.id)===key || emailKey(u.email||u.id)===emailKey(key));
      if(user) await resetAdminUserPassword(user);
    };
  });
}
async function removeAdminUserRecord(userLike){
  if(!isAdmin()){toast(t('needAdmin'));return;}
  const email=emailKey(userLike.email||userLike.id);
  const uid=userLike.source==='users' ? userLike.id : (userLike.uid||'');
  const ok=confirm(state.lang==='ar'
    ? `حذف صلاحية ${email} من النظام؟\nملاحظة: سيتم حذف صلاحياته من Firestore. حذف صفه من Firebase Authentication نفسه يحتاج Cloud Function أو حذف يدوي من Firebase Console.`
    : `Remove ${email} access from the system?\nNote: this removes Firestore access. Removing the row from Firebase Authentication itself needs a Cloud Function or manual deletion from Firebase Console.`);
  if(!ok) return;
  try{
    if(email) await deleteDoc(doc(db,'invitations',email)).catch(()=>{});
    if(uid && uid!==currentUser.uid) await deleteDoc(doc(db,'users',uid)).catch(()=>{});
    if(uid===currentUser.uid){ toast(state.lang==='ar'?'لا يمكن حذف الأدمن الحالي وهو داخل الحساب.':'You cannot delete the currently signed-in admin.'); return; }
    state.invitedUsers=(state.invitedUsers||[]).filter(u=>emailKey(u.email||u.id)!==email && u.id!==uid);
    await writeAudit(`Remove user access ${email || uid}`);
    toast(state.lang==='ar'?'تم حذف صلاحية المستخدم من النظام':'User access removed from the system');
    await renderAdmin();
  }catch(e){console.error(e); toast(e.message || 'Delete failed');}
}
function bindAdminDelete(){
  document.querySelectorAll('[data-invite-del]').forEach(btn=>{
    btn.onclick=async()=>{
      const key=btn.dataset.inviteDel;
      const user=(state.invitedUsers||[]).find(u=>String(u.id)===key || emailKey(u.email||u.id)===emailKey(key));
      if(user) await removeAdminUserRecord(user);
    };
  });
}
async function syncAdminRoleChange(userLike, role){
  if(!isAdmin()) return;
  const safeRole=ROLES.includes(role)?role:'partner';
  const email=emailKey(userLike.email||userLike.id);
  const uid=userLike.source==='users' ? userLike.id : (userLike.uid||'');
  try{
    if(email) await setDoc(doc(db,'invitations',email),{email,role:safeRole,updatedAt:serverTimestamp(),updatedBy:currentUser.email},{merge:true});
    if(uid) await setDoc(doc(db,'users',uid),{email,role:safeRole,updatedAt:serverTimestamp(),updatedBy:currentUser.email},{merge:true});
    await writeAudit(`Update user role ${email} to ${safeRole}`);
    toast(state.lang==='ar'?'تم تحديث الصلاحية':'Role updated');
  }catch(e){console.error(e); toast(e.message || 'Role update failed');}
}
async function renderAdmin(){
  await loadInvitesAndUsers(); await loadRemoteAudit();
  const users=(state.invitedUsers||[]).map((u,i)=>[
    u.email||u.id,
    select(u.role||'partner',`adminRole.${i}.role`,ROLES),
    u.source||'local',
    u.mustChangePassword ? (state.lang==='ar'?'تغيير مطلوب':'Change required') : (state.lang==='ar'?'طبيعي':'Normal'),
    u.defaultPasswordActive ? DEFAULT_FIRST_LOGIN_PASSWORD : '—',
    u.createdAt?.toDate?.()?.toLocaleString?.()||'',
    isAdmin()?`<div class="table-action-row"><button class="reset-btn admin-only" data-user-reset="${html(u.id||u.email)}">${state.lang==='ar'?'Reset password':'Reset password'}</button><button class="danger-btn admin-only" data-invite-del="${html(u.id||u.email)}">${t('delete')}</button></div>`:''
  ]);
  table('usersTable',[t('email'),t('role'),'Source',state.lang==='ar'?'حالة كلمة المرور':'Password status',state.lang==='ar'?'كلمة مرور أول دخول':'First login password','Created',t('action')],users);
  document.querySelectorAll('[data-path^="adminRole."]').forEach(el=>{
    el.onchange=async()=>{
      const index=Number(el.dataset.path.split('.')[1]);
      const user=state.invitedUsers[index];
      if(user){ user.role=el.value; await syncAdminRoleChange(user,el.value); }
    };
  });
  bindAdminDelete();
  bindAdminReset();
  applyPermissions();
  table('auditTable',['At','Action','User','Role'],(state.audit||[]).slice(0,60).map(a=>[a.at?new Date(a.at).toLocaleString():'',a.action||'',a.user||a.email||'',a.role||'']));
  document.getElementById('addUserBtn').onclick=async()=>{
    if(!isAdmin()){toast(t('needAdmin'));return;}
    const email=prompt(state.lang==='ar'?'أدخل إيميل المستخدم. أول دخول سيكون بكلمة المرور 123456':'Enter user email. First login password will be 123456');
    if(!email) return;
    const role=prompt('Role: admin / partner / investor / accountant','partner') || 'partner';
    try{
      const result = await createAuthUserFromAdmin(email, role);
      toast(result.authStatus==='already_exists' ? (state.lang==='ar'?'المستخدم موجود سابقًا — تم تحديث الصلاحية وإرسال رابط reset':'User already existed — role updated and reset email sent') : (state.lang==='ar'?'تم إنشاء المستخدم. أول دخول بكلمة المرور 123456':'User created. First login password is 123456'));
      await renderAdmin();
    }catch(e){
      console.error(e);
      toast(e.message || 'Could not create Firebase Auth user');
    }
  };
  document.getElementById('firebaseOps').innerHTML=[
    `<div class="insight-card"><strong>Project ID</strong><p>${firebaseConfig.projectId}</p></div>`,
    `<div class="insight-card"><strong>Workspace document</strong><p>workspaces/${WORKSPACE_ID}</p></div>`,
    `<div class="insight-card"><strong>Your role</strong><p>${currentRole} — ${canEdit()?t('fullAccess'):t('readOnly')}</p></div>`,
    `<div class="insight-card"><strong>Important</strong><p>${state.lang==='ar'?'إضافة الإيميل هنا تنشئ المستخدم داخل Firebase Authentication بكلمة مرور أولية 123456، وعند أول دخول يظهر بوب أب إجباري لتغييرها. زر Reset password يرسل رابط إعادة تعيين للمستخدمين الموجودين.':'Adding an email here creates the user in Firebase Authentication with first password 123456. On first login, a forced password-change popup appears. Reset password sends a reset email for existing users.'}</p></div>`
  ].join('');
}
function renderSettings(){
  const s=state.settings;
  document.getElementById('settingsForm').innerHTML=[field('Currency',input(s.currency,'settings.currency','text')),field('Fiscal start',input(s.fiscalStart,'settings.fiscalStart','text')),field('Period months',input(s.periodMonths,'settings.periodMonths')),field('Forecast months',input(s.forecastMonths,'settings.forecastMonths')),field('Payment gateway %',input(s.paymentFeePct,'settings.paymentFeePct')),field('Payment monthly fee',input(s.paymentGatewayMonthlyFee,'settings.paymentGatewayMonthlyFee')),field('Marketing reserve %',input(s.marketingReservePct,'settings.marketingReservePct')),field('Treat marketing reserve as expense',checkbox(s.treatMarketingReserveAsExpense,'settings.treatMarketingReserveAsExpense')),field('Delivery in scope',checkbox(s.deliveryInScope,'settings.deliveryInScope')),field('VAT as separate line',checkbox(s.vatAsSeparateLine,'settings.vatAsSeparateLine')),field('Autosave',checkbox(s.autoSave,'settings.autoSave'))].join(''); bindCells();
}
function renderScenarioChart(){
  const ctx=document.getElementById('scenarioChart'); if(!ctx || !window.Chart) return; const labels=SCENARIO_KEYS.map(k=>state.scenarios[k].name); const profits=SCENARIO_KEYS.map(k=>calcScenario(k).netProfit); if(charts.scenario) charts.scenario.destroy(); charts.scenario=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Net profit',data:profits}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8ea3bf'}},y:{ticks:{color:'#8ea3bf'}}}}});
}
function renderBridgeChart(){
  const ctx=document.getElementById('bridgeChart'); if(!ctx || !window.Chart) return; const c=calcScenario(); if(charts.bridge) charts.bridge.destroy(); charts.bridge=new Chart(ctx,{type:'bar',data:{labels:['Revenue','Points','Fees','Expenses','Profit'],datasets:[{label:'JOD',data:[c.totalRevenue,-c.pointLiability,-c.paymentFees,-(c.expenseItems+c.marketingReserveExpense),c.netProfit]}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8ea3bf'}},y:{ticks:{color:'#8ea3bf'}}}}});
}
function renderSectorChart(){
  const ctx=document.getElementById('sectorChart'); if(!ctx || !window.Chart) return; const rows=sectorStats().slice(0,8); if(charts.sector) charts.sector.destroy(); charts.sector=new Chart(ctx,{type:'doughnut',data:{labels:rows.map(r=>r.sector),datasets:[{data:rows.map(r=>Math.max(0,r.profit))}]},options:{responsive:true,plugins:{legend:{labels:{color:'#8ea3bf'}}}}});
}

function downloadFile(name, content, type='text/plain'){const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); toast(t('exportOk'))}
function exportJson(){downloadFile('dealit-financial-os-v2.json',JSON.stringify(state,null,2),'application/json')}
function exportCsv(){
  const rows=[['Metric','Value'],['GMV',calcScenario().gmv],['Commission revenue',calcScenario().commissionRevenue],['Point liability',calcScenario().pointLiability],['Net profit',calcScenario().netProfit],['Break-even GMV',calcScenario().breakEvenGMV]];
  downloadFile('dealit-summary.csv',rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv');
}
function exportExcel(){
  if(!window.XLSX){toast('XLSX library not loaded'); return;}
  const wb=XLSX.utils.book_new();
  const summary=[['Metric','Value'],...Object.entries(calcScenario()).filter(([k,v])=>typeof v==='number').map(([k,v])=>[k,v])];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),'Summary');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.merchants),'Merchants');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.sectors),'Sectors');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(plRows().map(r=>({line:r[0],value:r[1]}))),'P&L');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(journalEntries().map(r=>({memo:r[0],drcr:r[1],account:r[2],amount:r[3]}))),'Journal');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sectorBreakEvenRows()),'Sector BE');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(merchantBreakEvenRows()),'Merchant BE');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(merchantAttractionRows()),'Store Attraction');
  const destinations=merchantAttractionRows();
  const matrixRows=pointRedemptionMatrix().map(row=>{
    const out={source:row.source,sector:row.sector,pointsIssued:row.issued,expectedRedeemed:row.expectedRedeemed,rowTotalPct:row.rowTotalPct,breakage:row.breakage};
    row.cells.forEach(c=>{out[`${c.destination} distribution %`]=c.distributionPct; out[`${c.destination} probability of issued %`]=c.probability*100; out[`${c.destination} expected JOD`]=c.amount;});
    return out;
  });
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(matrixRows),'Point Matrix');
  XLSX.writeFile(wb,'dealit-financial-os-v2-8.xlsx');
}
function exportPpt(){
  if(!window.pptxgen){toast(t('pptMissing'));return;} const pptx=new pptxgen(); pptx.layout='LAYOUT_WIDE'; pptx.author='Dealit Financial OS';
  const addSlide=(title,lines)=>{const s=pptx.addSlide(); s.background={color:'07111F'}; s.addText(title,{x:.45,y:.35,w:12,h:.5,fontSize:24,bold:true,color:'FFFFFF'}); lines.forEach((l,i)=>s.addText(l,{x:.65,y:1.1+i*.55,w:11.5,h:.35,fontSize:15,color:i%2?'AFC2DF':'FFFFFF'}));};
  const c=calcScenario(); addSlide('Dealit Financial OS',[`GMV: ${money(c.gmv)}`,`Weighted commission: ${pct(c.weightedCommission)}`,`Point liability: ${money(c.pointLiability)}`,`Net profit: ${money(c.netProfit)}`,`Break-even GMV: ${money(c.breakEvenGMV)}`]);
  addSlide('Scenario comparison',SCENARIO_KEYS.map(k=>`${state.scenarios[k].name}: ${money(calcScenario(k).netProfit)} net profit`));
  addSlide('Accounting view',plRows().map(r=>`${r[0]}: ${money(r[1])}`));
  addSlide('Top sectors',sectorStats().slice(0,7).map(r=>`${r.sector}: GMV ${money(r.gmv)} | Profit ${money(r.profit)}`));
  addSlide('Store attraction',merchantAttractionRows().slice(0,7).map(r=>`${r.name}: Suggested ${pct(r.suggested)} | Final ${pct(r.score)} | Share ${pct(r.share)}`));
  addSlide('Point matrix summary',pointRedemptionMatrix().slice(0,7).map(r=>`${r.source}: issued ${money(r.issued)} | expected redeemed ${money(r.expectedRedeemed)} | row total ${pct(r.rowTotalPct)} | breakage ${money(r.breakage)}`));
  pptx.writeFile({fileName:'dealit-financial-os-v2-9.pptx'});
}


function setForcePasswordModalText(){
  const ar=state.lang==='ar';
  const map={
    forcePasswordTitle: ar?'تغيير كلمة المرور':'Change password',
    forcePasswordText: ar?'لأمان الحساب، غيّر كلمة المرور قبل الدخول للنظام.':'For account security, change your password before continuing.',
    newPasswordLabel: ar?'كلمة المرور الجديدة':'New password',
    confirmPasswordLabel: ar?'تأكيد كلمة المرور':'Confirm password',
    showNewPasswordText: ar?'إظهار كلمة المرور':'Show my password',
    changePasswordBtn: ar?'تحديث كلمة المرور':'Update password',
    forcePasswordNote: ar?'بعد التحديث ستدخل دائمًا بكلمة المرور الجديدة.':'After updating, you will use the new password for future logins.'
  };
  Object.entries(map).forEach(([id,text])=>{const el=document.getElementById(id); if(el) el.textContent=text;});
}
function openForcePasswordModal(){
  setForcePasswordModalText();
  const modal=document.getElementById('forcePasswordModal');
  if(modal){ modal.hidden=false; document.getElementById('newPasswordInput')?.focus(); }
}
function closeForcePasswordModal(){
  const modal=document.getElementById('forcePasswordModal');
  if(modal) modal.hidden=true;
}
async function completeForcedPasswordChange(){
  const p1=document.getElementById('newPasswordInput')?.value || '';
  const p2=document.getElementById('confirmPasswordInput')?.value || '';
  const btn=document.getElementById('changePasswordBtn');
  const note=document.getElementById('forcePasswordNote');
  if(p1.length < 6){ toast(state.lang==='ar'?'كلمة المرور يجب أن تكون 6 خانات على الأقل':'Password must be at least 6 characters'); return; }
  if(p1 !== p2){ toast(state.lang==='ar'?'كلمتا المرور غير متطابقتين':'Passwords do not match'); return; }
  if(p1 === DEFAULT_FIRST_LOGIN_PASSWORD){ toast(state.lang==='ar'?'اختار كلمة مرور مختلفة عن 123456':'Choose a password different from 123456'); return; }
  if(!auth.currentUser){ toast(state.lang==='ar'?'الجلسة غير فعالة، سجّل الدخول مرة أخرى':'Session is not active. Log in again.'); return; }
  try{
    if(btn){ btn.disabled=true; btn.textContent=state.lang==='ar'?'جاري تحديث كلمة المرور...':'Updating password...'; }
    if(note){ note.textContent=state.lang==='ar'?'جاري تحديث كلمة المرور داخل Firebase...':'Updating password in Firebase...'; }

    // Critical step: change the password for the currently signed-in user.
    // Do NOT wait on Firestore before letting the user enter the system.
    await updatePassword(auth.currentUser, p1);

    currentProfile={...(currentProfile||{}),mustChangePassword:false,defaultPasswordActive:false,passwordChangedAt:new Date().toISOString()};
    lastLoginPassword=p1;
    closeForcePasswordModal();
    render();
    toast(state.lang==='ar'?'تم تحديث كلمة المرور ودخولك للنظام':'Password updated. You are in the system.');

    // Background cleanup only. If Firestore rules are not updated yet, the app will not freeze.
    const uid=auth.currentUser.uid;
    const email=emailKey(auth.currentUser.email);
    const cleanup={mustChangePassword:false,defaultPasswordActive:false,passwordChangedAt:serverTimestamp()};
    Promise.allSettled([
      setDoc(doc(db,'users',uid), cleanup, {merge:true}),
      setDoc(doc(db,'invitations',email), cleanup, {merge:true}),
      writeAudit('Forced password changed')
    ]).then(results=>{
      const rejected=results.filter(r=>r.status==='rejected');
      if(rejected.length){ console.warn('Password flag cleanup did not fully complete:', rejected.map(r=>r.reason?.message||r.reason)); }
    });
  }catch(e){
    console.error(e);
    if(e.code === 'auth/requires-recent-login'){
      toast(state.lang==='ar'?'انتهت جلسة الأمان. اعمل Logout ثم ادخل بكلمة 123456 وحاول مباشرة.':'Security session expired. Log out, log in with 123456, and try immediately.');
    }else{
      toast(e.message || (state.lang==='ar'?'تعذر تحديث كلمة المرور':'Could not update password'));
    }
  }finally{
    if(btn){ btn.disabled=false; btn.textContent=state.lang==='ar'?'تحديث كلمة المرور':'Update password'; }
    if(note){ note.textContent=state.lang==='ar'?'بعد التحديث ستدخل دائمًا بكلمة المرور الجديدة.':'After updating, you will use the new password for future logins.'; }
  }
}
function wire(){
  document.getElementById('langBtn').onclick=()=>{state.lang=state.lang==='ar'?'en':'ar'; render(); scheduleSave('Language change')};
  document.getElementById('themeBtn').onclick=()=>document.body.classList.toggle('light');
  document.getElementById('undoBtn').onclick=()=>{ if(!undoStack.length){return;} const prev=JSON.parse(undoStack.pop()).data; state=prev; toast(t('undoDone')); render(); scheduleSave('Undo') };
  document.getElementById('saveNowBtn').onclick=()=>saveCloud('Manual save');
  document.getElementById('logoutBtn').onclick=()=>signOut(auth);
  const viewModeSelect=document.getElementById('viewModeSelect');
  if(viewModeSelect) viewModeSelect.onchange=()=>{ state.viewMode=viewModeSelect.value; render(); };
  const mobileFab=document.getElementById('mobileFab'); const mobileQuickSheet=document.getElementById('mobileQuickSheet');
  if(mobileFab) mobileFab.onclick=()=>{ mobileQuickSheet.hidden=false; };
  document.getElementById('closeQuickSheet')?.addEventListener('click',()=>{ mobileQuickSheet.hidden=true; });
  document.querySelectorAll('[data-mobile-add]').forEach(btn=>btn.onclick=()=>{ mobileQuickSheet.hidden=true; const action=btn.dataset.mobileAdd; if(!canEdit()){toast(t('editBlocked'));return;} if(action==='merchant'){state.currentPage='merchants'; mutate('Quick add merchant',()=>state.merchants.push({id:uid('m'),name:'New merchant',sector:sectorOptions()[0]||'Food & Beverage',subSector:subSectorOptions(sectorOptions()[0])[0]||'',monthlyOrders:0,aov:0,commissionPct:0,rewardPct:0,redemptionCapPct:n(state.settings.generalRedemptionCapPct),subscription:0,subscriptionCycle:'monthly',merchantMarginPct:0,contractStart:'',contractEnd:'',settlementCycle:'monthly',visibilityScore:50,offerStrengthScore:50,brandPullScore:50,repeatPurchaseScore:50,attractionOverridePct:0,active:true}));}
    if(action==='revenue'){state.currentPage='items'; mutate('Quick add revenue',()=>state.revenues.push({id:uid('r'),name:'New revenue',type:'fixed_monthly',amount:0,active:true}));}
    if(action==='expense'){state.currentPage='items'; mutate('Quick add expense',()=>state.expenses.push({id:uid('e'),name:'New expense',type:'fixed_monthly',amount:0,active:true}));}
    if(action==='campaign'){state.currentPage='points'; mutate('Quick add campaign',()=>state.campaigns.push({id:uid('c'),name:'New campaign',sector:'',bonusPointsPct:0,funding:'dealit',dealitSharePct:100,monthlyBudget:0,active:true}));}
  });

  const emailInput=document.getElementById('emailInput');
  const passwordInput=document.getElementById('passwordInput');
  const loginBtn=document.getElementById('loginBtn');
  const signupBtn=document.getElementById('signupBtn');
  const resetPassBtn=document.getElementById('resetPassBtn');
  const showPasswordInput=document.getElementById('showPasswordInput');
  const showNewPasswordInput=document.getElementById('showNewPasswordInput');
  const newPasswordInput=document.getElementById('newPasswordInput');
  const confirmPasswordInput=document.getElementById('confirmPasswordInput');
  const changePasswordBtn=document.getElementById('changePasswordBtn');

  loginBtn.onclick=()=>login(false);
  if(signupBtn) signupBtn.onclick=()=>login(true);
  if(showPasswordInput) showPasswordInput.onchange=()=>{ passwordInput.type=showPasswordInput.checked?'text':'password'; };
  if(showNewPasswordInput) showNewPasswordInput.onchange=()=>{ const type=showNewPasswordInput.checked?'text':'password'; if(newPasswordInput) newPasswordInput.type=type; if(confirmPasswordInput) confirmPasswordInput.type=type; };
  if(changePasswordBtn) changePasswordBtn.onclick=completeForcedPasswordChange;
  [newPasswordInput,confirmPasswordInput].filter(Boolean).forEach(input=>input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); completeForcedPasswordChange(); } }));
  [emailInput,passwordInput].forEach(input=>input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ e.preventDefault(); login(false); }
  }));
  resetPassBtn.onclick=async()=>{const email=emailKey(emailInput.value); if(!email) return; try{await sendPasswordResetEmail(auth,email); toast(t('resetSent'))}catch(e){toast(`${t('resetError')}: ${e.message}`)}};
  document.getElementById('exportJsonBtn').onclick=exportJson; document.getElementById('csvBtn').onclick=exportCsv; document.getElementById('excelBtn').onclick=exportExcel; document.getElementById('printBtn').onclick=()=>window.print(); document.getElementById('pptBtn').onclick=exportPpt;
}
async function login(signup=false){
  const email=emailKey(document.getElementById('emailInput').value); const pass=document.getElementById('passwordInput').value;
  const remember=document.getElementById('rememberMeInput')?.checked ?? true;
  if(!email || !pass){ toast(t('signInError')); return; }
  try{
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    lastLoginPassword = pass;
    if(signup) await createUserWithEmailAndPassword(auth,email,pass);
    else await signInWithEmailAndPassword(auth,email,pass);
  }
  catch(e){toast(`${signup?t('signUpError'):t('signInError')}: ${e.message}`)}
}
onAuthStateChanged(auth, async user=>{
  currentUser=user; const authLayer=document.getElementById('authLayer'), appShell=document.getElementById('appShell');
  if(!user){ currentRole='guest'; currentProfile=null; setAuthGate(false); closeForcePasswordModal(); setCloudStatus('cloudOffline'); return; }
  try{
    const profile=await getUserProfile(user);
    if(!profile){ document.getElementById('authStatus').textContent=t('noAccess'); await signOut(auth); return; }
    currentProfile=profile;
    currentRole=profile.role||'partner'; if(currentRole==='investor') state.viewMode='investor'; setAuthGate(true); await loadWorkspace(); await loadRemoteAudit(); render(); toast(t('loaded'));
    const loggedWithDefaultPassword = lastLoginPassword === DEFAULT_FIRST_LOGIN_PASSWORD;
    const needsForcedChange = (profile.mustChangePassword || profile.defaultPasswordActive) && loggedWithDefaultPassword;
    if(needsForcedChange){
      openForcePasswordModal();
    }else if((profile.mustChangePassword || profile.defaultPasswordActive) && !loggedWithDefaultPassword){
      // The user is already using a non-default password. Clear old flags in the background and do not block access.
      currentProfile={...profile,mustChangePassword:false,defaultPasswordActive:false};
      const cleanup={mustChangePassword:false,defaultPasswordActive:false,passwordChangedAt:serverTimestamp()};
      setDoc(doc(db,'users',user.uid), cleanup, {merge:true}).catch(err=>console.warn('Could not clear password flag:', err.message));
      setDoc(doc(db,'invitations',emailKey(user.email)), cleanup, {merge:true}).catch(()=>{});
    }
  }catch(e){console.error(e); document.getElementById('authStatus').textContent=e.message; toast(e.message);}
});

setAuthGate(false);
wire();
// Do not render the app before authentication; this prevents mobile UI from appearing behind login.
