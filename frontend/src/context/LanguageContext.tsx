import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Translation types
type TranslationKey = keyof typeof translations.ro;

interface LanguageContextType {
  language: 'ro' | 'ru';
  t: (key: TranslationKey) => string;
  setLanguage: (lang: 'ro' | 'ru') => void;
}

// All translations
const translations = {
  ro: {
    // Navigation & Tabs
    home: 'Acasă',
    bookings: 'Rezervări',
    profile: 'Profil',
    back: 'Înapoi',
    
    // Home Screen
    greeting: 'Bună',
    guest: 'Vizitator',
    findPerfectCar: 'Găsește mașina perfectă',
    filterCars: 'Filtrează mașinile',
    availableCars: 'Mașini Disponibile',
    loadingCars: 'Se încarcă mașinile...',
    noCarsAvailable: 'Nicio mașină disponibilă',
    day: 'zi',
    days: 'zile',
    office: 'Oficiu',
    chisinauAirport: 'Aeroport Chișinău',
    iasiAirport: 'Aeroport Iași',
    
    // Profile Screen
    myProfile: 'Profilul meu',
    myBookings: 'Rezervările mele',
    notAuthenticated: 'Nu ești autentificat',
    loginToSeeProfile: 'Autentifică-te pentru a vedea profilul tău.',
    changePhoto: 'Schimbă poza',
    account: 'Cont',
    changeName: 'Schimbă numele',
    favorites: 'Favorite',
    language: 'Limbă',
    collaboration: 'Colaborare',
    becomePartner: 'Devino Partener',
    support: 'Suport',
    help: 'Ajutor',
    termsAndConditions: 'Termeni și Condiții',
    privacyPolicy: 'Politică de Confidențialitate',
    logout: 'Deconectează-te',
    logoutConfirm: 'Sigur dorești să te deconectezi?',
    cancel: 'Anulează',
    logoutButton: 'Deconectează-mă',
    administrator: 'Administrator',
    
    // Bookings Screen
    noBookings: 'Nu ai rezervări',
    makeFirstBooking: 'Fă prima ta rezervare pentru a o vedea aici.',
    pending: 'În așteptare',
    confirmed: 'Confirmată',
    completed: 'Finalizată',
    cancelled: 'Anulată',
    
    // Change Name Screen
    changeNameTitle: 'Schimbă Numele',
    currentName: 'Nume actual',
    newName: 'Nume nou',
    enterNewName: 'Introdu noul nume',
    save: 'Salvează',
    saving: 'Se salvează...',
    nameUpdated: 'Numele a fost actualizat!',
    error: 'Eroare',
    success: 'Succes',
    
    // Favorites Screen
    favoritesTitle: 'Favorite',
    noFavorites: 'Nicio mașină favorită',
    addFavoritesHint: 'Adaugă mașini la favorite apăsând pe inimă.',
    
    // FAQ Screen
    faqTitle: 'Întrebări Frecvente',
    findAnswers: 'Găsește răspunsuri la întrebările tale',
    noFaqs: 'Nu există întrebări disponibile momentan',
    
    // Terms & Privacy
    contentNotAvailable: 'Conținutul nu este disponibil momentan.',
    
    // Contacts
    contacts: 'Contacte',
    contactUs: 'Contactează-ne',
    ourLocation: 'Locația noastră',
    callUs: 'Sună-ne',
    emailUs: 'Scrie-ne',
    messageUs: 'Trimite mesaj',
    
    // Login Screen
    premiumRentals: 'Închirieri Auto Premium',
    continueWithPhone: 'Continuă cu Telefon',
    continueWithGoogle: 'Continuă cu Google',
    noAccount: 'Nu ai cont?',
    register: 'Înregistrează-te',
    agreeToTerms: 'Continuând, ești de acord cu Termenii și Condițiile noastre',
    
    // Register Screen
    registerTitle: 'Înregistrare',
    fullName: 'Nume complet',
    phoneNumber: 'Număr de telefon',
    email: 'Email',
    password: 'Parolă',
    confirmPassword: 'Confirmă parola',
    registerButton: 'Înregistrează-te',
    haveAccount: 'Ai deja cont?',
    login: 'Autentifică-te',
    
    // Car Details
    carDetails: 'Detalii Mașină',
    specifications: 'Specificații',
    priceTable: 'Tabel Prețuri',
    bookNow: 'Rezervă Acum',
    perDay: '/zi',
    
    // Partner Screen
    becomePartnerTitle: 'Devino Partener',
    
    // Rental Filters
    pickupDate: 'Data ridicare',
    returnDate: 'Data returnare',
    pickupTime: 'Ora ridicare',
    returnTime: 'Ora returnare',
    location: 'Locație',
    insurance: 'Asigurare',
    rca: 'RCA (inclusă)',
    casco: 'CASCO',
    
    // Misc
    loading: 'Se încarcă...',
    refresh: 'Reîmprospătează',
    close: 'Închide',
    confirm: 'Confirmă',
    delete: 'Șterge',
    edit: 'Editează',
    add: 'Adaugă',
    languageChanged: 'Limba a fost schimbată în',
    romanian: 'Română',
    russian: 'Русский',
  },
  ru: {
    // Navigation & Tabs
    home: 'Главная',
    bookings: 'Бронирования',
    profile: 'Профиль',
    back: 'Назад',
    
    // Home Screen
    greeting: 'Привет',
    guest: 'Гость',
    findPerfectCar: 'Найди идеальный автомобиль',
    filterCars: 'Фильтровать автомобили',
    availableCars: 'Доступные Автомобили',
    loadingCars: 'Загрузка автомобилей...',
    noCarsAvailable: 'Нет доступных автомобилей',
    day: 'день',
    days: 'дней',
    office: 'Офис',
    chisinauAirport: 'Аэропорт Кишинёв',
    iasiAirport: 'Аэропорт Яссы',
    
    // Profile Screen
    myProfile: 'Мой профиль',
    myBookings: 'Мои бронирования',
    notAuthenticated: 'Вы не авторизованы',
    loginToSeeProfile: 'Войдите, чтобы увидеть свой профиль.',
    changePhoto: 'Изменить фото',
    account: 'Аккаунт',
    changeName: 'Изменить имя',
    favorites: 'Избранное',
    language: 'Язык',
    collaboration: 'Сотрудничество',
    becomePartner: 'Стать Партнёром',
    support: 'Поддержка',
    help: 'Помощь',
    termsAndConditions: 'Условия использования',
    privacyPolicy: 'Политика конфиденциальности',
    logout: 'Выйти',
    logoutConfirm: 'Вы уверены, что хотите выйти?',
    cancel: 'Отмена',
    logoutButton: 'Выйти',
    administrator: 'Администратор',
    
    // Bookings Screen
    noBookings: 'У вас нет бронирований',
    makeFirstBooking: 'Сделайте первое бронирование, чтобы увидеть его здесь.',
    pending: 'В ожидании',
    confirmed: 'Подтверждено',
    completed: 'Завершено',
    cancelled: 'Отменено',
    
    // Change Name Screen
    changeNameTitle: 'Изменить Имя',
    currentName: 'Текущее имя',
    newName: 'Новое имя',
    enterNewName: 'Введите новое имя',
    save: 'Сохранить',
    saving: 'Сохранение...',
    nameUpdated: 'Имя успешно обновлено!',
    error: 'Ошибка',
    success: 'Успешно',
    
    // Favorites Screen
    favoritesTitle: 'Избранное',
    noFavorites: 'Нет избранных автомобилей',
    addFavoritesHint: 'Добавьте автомобили в избранное, нажав на сердечко.',
    
    // FAQ Screen
    faqTitle: 'Часто Задаваемые Вопросы',
    findAnswers: 'Найдите ответы на ваши вопросы',
    noFaqs: 'Нет доступных вопросов',
    
    // Terms & Privacy
    contentNotAvailable: 'Содержание недоступно в данный момент.',
    
    // Contacts
    contacts: 'Контакты',
    contactUs: 'Свяжитесь с нами',
    ourLocation: 'Наше расположение',
    callUs: 'Позвоните нам',
    emailUs: 'Напишите нам',
    messageUs: 'Отправить сообщение',
    
    // Login Screen
    premiumRentals: 'Премиум Аренда Авто',
    continueWithPhone: 'Войти по телефону',
    continueWithGoogle: 'Войти через Google',
    noAccount: 'Нет аккаунта?',
    register: 'Зарегистрироваться',
    agreeToTerms: 'Продолжая, вы соглашаетесь с нашими Условиями использования',
    
    // Register Screen
    registerTitle: 'Регистрация',
    fullName: 'Полное имя',
    phoneNumber: 'Номер телефона',
    email: 'Эл. почта',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    registerButton: 'Зарегистрироваться',
    haveAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    
    // Car Details
    carDetails: 'Детали Автомобиля',
    specifications: 'Характеристики',
    priceTable: 'Таблица Цен',
    bookNow: 'Забронировать',
    perDay: '/день',
    
    // Partner Screen
    becomePartnerTitle: 'Стать Партнёром',
    
    // Rental Filters
    pickupDate: 'Дата получения',
    returnDate: 'Дата возврата',
    pickupTime: 'Время получения',
    returnTime: 'Время возврата',
    location: 'Локация',
    insurance: 'Страховка',
    rca: 'RCA (включена)',
    casco: 'КАСКО',
    
    // Misc
    loading: 'Загрузка...',
    refresh: 'Обновить',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    languageChanged: 'Язык изменён на',
    romanian: 'Română',
    russian: 'Русский',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<'ro' | 'ru'>('ro');

  // Sync language with user preference
  useEffect(() => {
    if (user?.language) {
      setLanguageState(user.language as 'ro' | 'ru');
    }
  }, [user?.language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.ro[key] || key;
  };

  const setLanguage = (lang: 'ro' | 'ru') => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export translations for external use
export { translations };
