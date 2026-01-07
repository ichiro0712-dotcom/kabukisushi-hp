// Google Analytics 4 Event Tracking Utilities
// GTM ID: GTM-PCWMP294

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer if not exists
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

// Generic event tracking function
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};

// Page view tracking
export const trackPageView = (pageName: string, pageTitle?: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    page_title: pageTitle || pageName,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

// Button click tracking
export const trackButtonClick = (
  buttonName: string,
  buttonLocation: string,
  additionalParams?: Record<string, string>
) => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
    ...additionalParams,
  });
};

// Reservation button click
export const trackReservationClick = (location: string) => {
  trackEvent('reservation_click', {
    click_location: location,
    destination: 'tablecheck',
  });
};

// Phone button click
export const trackPhoneClick = (location: string) => {
  trackEvent('phone_click', {
    click_location: location,
    phone_number: '03-6302-1477',
  });
};

// SNS button click
export const trackSnsClick = (platform: string, location: string) => {
  trackEvent('sns_click', {
    platform: platform, // instagram, facebook, tiktok, youtube
    click_location: location,
  });
};

// Menu section view
export const trackMenuSectionView = (sectionName: string) => {
  trackEvent('menu_section_view', {
    section_name: sectionName, // nigiri, makimono, ippin, drink
  });
};

// Menu item view
export const trackMenuItemView = (
  itemName: string,
  category: string,
  price: string
) => {
  trackEvent('menu_item_view', {
    item_name: itemName,
    category: category,
    price: price,
  });
};

// Language switch tracking
export const trackLanguageSwitch = (fromLang: string, toLang: string) => {
  trackEvent('language_switch', {
    from_language: fromLang,
    to_language: toLang,
  });
};

// Scroll depth tracking
export const trackScrollDepth = (depth: number, pageName: string) => {
  trackEvent('scroll_depth', {
    scroll_percentage: depth,
    page_name: pageName,
  });
};

// Gallery interaction
export const trackGalleryInteraction = (action: string, imageIndex?: number) => {
  trackEvent('gallery_interaction', {
    action: action, // view, next, prev, zoom
    image_index: imageIndex ?? 0,
  });
};

// Map/Access click
export const trackAccessClick = (action: string) => {
  trackEvent('access_click', {
    action: action, // google_maps, directions
  });
};

// Course selection view
export const trackCourseView = (courseName: string, price: string) => {
  trackEvent('course_view', {
    course_name: courseName,
    price: price,
  });
};

// Section visibility tracking (for scroll tracking)
export const trackSectionVisible = (sectionId: string) => {
  trackEvent('section_visible', {
    section_id: sectionId,
  });
};

// Drink menu view
export const trackDrinkView = (drinkName: string, category: string) => {
  trackEvent('drink_view', {
    drink_name: drinkName,
    category: category, // nihonshu, shochu, beer, wine, etc.
  });
};

// Mobile menu toggle
export const trackMobileMenuToggle = (isOpen: boolean) => {
  trackEvent('mobile_menu_toggle', {
    action: isOpen ? 'open' : 'close',
  });
};

// Affiliated store click
export const trackAffiliatedStoreClick = (storeName: string) => {
  trackEvent('affiliated_store_click', {
    store_name: storeName,
  });
};
