export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'kok', label: 'कोंकणी (Konkani)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
];

export const UI_DICT: Record<string, any> = {
    en: {
        back: "← Back to Dashboard", title: "Review & Verify", subtitle: "Verify extracted directives.",
        clickLocate: "Click an item to locate source text.", namePlaceholder: "Reviewer Name (Required)",
        dept: "Dept:", deadline: "Deadline:", sourceEvidence: "Source Evidence", rationale: "Rationale:",
        complianceRisk: "Compliance Risk", approve: "Approve", reject: "Reject",
        verified: "Verified & Approved", rejected: "Rejected by Reviewer",
        publishBtn: "Publish Verified Plan to Dashboard →", lockedMsg: "This case has been verified and published. Decisions are locked."
    },
    hi: {
        back: "← डैशबोर्ड पर वापस जाएं", title: "समीक्षा और सत्यापन", subtitle: "निकाले गए निर्देशों का सत्यापन करें।",
        clickLocate: "स्रोत पाठ खोजने के लिए क्लिक करें।", namePlaceholder: "समीक्षक का नाम",
        dept: "विभाग:", deadline: "समय सीमा:", sourceEvidence: "स्रोत साक्ष्य", rationale: "तर्क:",
        complianceRisk: "अनुपालन जोखिम", approve: "स्वीकार करें", reject: "अस्वीकार करें",
        verified: "सत्यापित और स्वीकृत", rejected: "अस्वीकृत",
        publishBtn: "डैशबोर्ड पर प्रकाशित करें →", lockedMsg: "इस मामले को सत्यापित और प्रकाशित किया जा चुका है।"
    },
    mr: {
        back: "← डॅशबोर्डवर परत जा", title: "पुनरावलोकन आणि पडताळणी", subtitle: "काढलेल्या निर्देशांची पडताळणी करा.",
        clickLocate: "मूळ मजकूर शोधण्यासाठी क्लिक करा.", namePlaceholder: "पुनरावलोकनकर्त्याचे नाव",
        dept: "विभाग:", deadline: "अंतिम मुदत:", sourceEvidence: "मूळ पुरावा", rationale: "तर्क:",
        complianceRisk: "अनुपालन जोखीम", approve: "मंजूर करा", reject: "नाकार करा",
        verified: "सत्यापित आणि मंजूर", rejected: "नाकारले",
        publishBtn: "डॅशबोर्डवर प्रकाशित करा →", lockedMsg: "हे प्रकरण सत्यापित आणि प्रकाशित केले गेले आहे. निर्णय लॉक आहेत."
    },
    kok: {
        back: "← डॅशबोर्डाचेर परत वचा", title: "पुनरावलोकन आनी पडताळणी", subtitle: "काडिल्ल्या निर्देशांची पडताळणी करात.",
        clickLocate: "मूळ मजकूर सोदपाक क्लिक करात.", namePlaceholder: "पुनरावलोकनकर्त्याचे नाव",
        dept: "विभाग:", deadline: "अंतिम मुदत:", sourceEvidence: "मूळ पुरावा", rationale: "तर्क:",
        complianceRisk: "अनुपालन जोखीम", approve: "मंजूर करात", reject: "नकार दियात",
        verified: "सत्यापित आनी मंजूर", rejected: "न्हयकारला",
        publishBtn: "डॅशबोर्डार प्रकाशीत करात →", lockedMsg: "हें प्रकरण सत्यापित आनी प्रकाशीत जालां. निर्णय लॉक आसात."
    },
    gu: {
        back: "← ડેશબોર્ડ પર પાછા જાઓ", title: "સમીક્ષા અને ચકાસણી", subtitle: "નિર્દેશોની ચકાસણી કરો.",
        clickLocate: "સ્ત્રોત શોધવા માટે ક્લિક કરો.", namePlaceholder: "સમીક્ષકનું નામ",
        dept: "વિભાગ:", deadline: "અંતિમ તારીખ:", sourceEvidence: "સ્ત્રોત પુરાવા", rationale: "તર્ક:",
        complianceRisk: "પાલન જોખમ", approve: "મંજૂર કરો", reject: "નકારો",
        verified: "ચકાસાયેલ અને મંજૂર", rejected: "નકારવામાં આવ્યું",
        publishBtn: "ડેશબોર્ડ પર પ્રકાશિત કરો →", lockedMsg: "આ કેસ ચકાસાયેલ છે અને નિર્ણયો લૉક છે."
    },
    bn: {
        back: "← ড্যাশবোর্ডে ফিরে যান", title: "পর্যালোচনা এবং যাচাইকরণ", subtitle: "নির্দেশাবলী যাচাই করুন।",
        clickLocate: "উৎস পাঠ্য সনাক্ত করতে ক্লিক করুন।", namePlaceholder: "পর্যালোচকের নাম",
        dept: "বিভাগ:", deadline: "সময়সীমা:", sourceEvidence: "উৎস প্রমাণ", rationale: "যুক্তি:",
        complianceRisk: "সম্মতি ঝুঁকি", approve: "অনুমোদন করুন", reject: "প্রত্যাখ্যান করুন",
        verified: "যাচাইকৃত এবং অনুমোদিত", rejected: "প্রত্যাখ্যাত",
        publishBtn: "ড্যাশবোর্ডে প্রকাশ করুন →", lockedMsg: "এই মামলাটি যাচাই এবং প্রকাশ করা হয়েছে।"
    },
    ta: {
        back: "← டாஷ்போர்டுக்குத் திரும்பு", title: "மதிப்பாய்வு மற்றும் சரிபார்ப்பு", subtitle: "வழிமுறைகளை சரிபார்க்கவும்.",
        clickLocate: "மூல உரையைக் கண்டறிய கிளிக் செய்யவும்.", namePlaceholder: "மதிப்பாய்வாளர் பெயர்",
        dept: "துறை:", deadline: "கெடு:", sourceEvidence: "மூல ஆதாரம்", rationale: "காரணம்:",
        complianceRisk: "இணக்க ஆபத்து", approve: "ஒப்புதல்", reject: "நிராகரி",
        verified: "சரிபார்க்கப்பட்டு அங்கீகரிக்கப்பட்டது", rejected: "நிராகரிக்கப்பட்டது",
        publishBtn: "டாஷ்போர்டில் வெளியிடு →", lockedMsg: "இந்த வழக்கு சரிபார்க்கப்பட்டு வெளியிடப்பட்டது."
    },
    te: {
        back: "← డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", title: "సమీక్ష & ధృవీకరణ", subtitle: "సూచనలను ధృవీకరించండి.",
        clickLocate: "మూల వచనాన్ని కనుగొనడానికి క్లిక్ చేయండి.", namePlaceholder: "సమీక్షకుడి పేరు",
        dept: "విభాగం:", deadline: "గడువు:", sourceEvidence: "మూల ఆధారం", rationale: "కారణం:",
        complianceRisk: "సమ్మతి ప్రమాదం", approve: "ఆమోదించు", reject: "తిరస్కరించు",
        verified: "ధృవీకరించబడింది మరియు ఆమోదించబడింది", rejected: "తిరస్కరించబడింది",
        publishBtn: "డాష్‌బోర్డ్‌లో ప్రచురించండి →", lockedMsg: "ఈ కేసు ధృవీకరించబడింది మరియు ప్రచురించబడింది."
    },
    kn: {
        back: "← ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ", title: "ವಿಮರ್ಶೆ ಮತ್ತು ಪರಿಶೀಲನೆ", subtitle: "ಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        clickLocate: "ಮೂಲ ಪಠ್ಯವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಕ್ಲಿಕ್ ಮಾಡಿ.", namePlaceholder: "ವಿಮರ್ಶಕರ ಹೆಸರು",
        dept: "ಇಲಾಖೆ:", deadline: "ಗಡುವು:", sourceEvidence: "ಮೂಲ ಪುರಾವೆ", rationale: "ತರ್ಕ:",
        complianceRisk: "ಅನುಸರಣೆ ಅಪಾಯ", approve: "ಅನುಮೋದಿಸಿ", reject: "ತಿರಸ್ಕರಿಸಿ",
        verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಅನುಮೋದಿಸಲಾಗಿದೆ", rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
        publishBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪ್ರಕಟಿಸಿ →", lockedMsg: "ಈ ಪ್ರಕರಣವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಪ್ರಕಟಿಸಲಾಗಿದೆ."
    }
};