const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../constants');

const TEMPLATES = {
  [NOTIFICATION_TYPES.PROPERTY_APPROVED]: {
    en: { title: 'Listing Approved', message: 'Your property "{title}" is now LIVE on Nagpur Real Estate!' },
    hi: { title: 'लिस्टिंग स्वीकृत', message: 'आपकी प्रॉपर्टी "{title}" अब नागपुर रियल एस्टेट पर लाइव है!' },
    mr: { title: 'प्रॉपर्टी मंजूर', message: 'तुमची मालमत्ता "{title}" आता नागपूर रिअल इस्टेटवर थेट सक्रिय झाली आहे!' },
  },
  [NOTIFICATION_TYPES.PROPERTY_REJECTED]: {
    en: { title: 'Listing Needs Attention', message: 'Your property "{title}" was rejected: {reason}' },
    hi: { title: 'लिस्टिंग अस्वीकृत', message: 'आपकी प्रॉपर्टी "{title}" अस्वीकृत कर दी गई: {reason}' },
    mr: { title: 'प्रॉपर्टी नामंजूर', message: 'तुमची मालमत्ता "{title}" नाकारण्यात आली आहे: {reason}' },
  },
  [NOTIFICATION_TYPES.NEW_ENQUIRY]: {
    en: { title: 'New Buyer Enquiry', message: '{customerName} inquired about your property "{title}". Phone: {phoneNumber}' },
    hi: { title: 'नई खरीदार पूछताछ', message: '{customerName} ने आपकी प्रॉपर्टी "{title}" के बारे में पूछताछ की है। फोन: {phoneNumber}' },
    mr: { title: 'नवीन ग्राहक चौकशी', message: '{customerName} यांनी तुमच्या "{title}" प्रॉपर्टीसाठी चौकशी केली. फोन: {phoneNumber}' },
  },
  [NOTIFICATION_TYPES.LEAD_ASSIGNED]: {
    en: { title: 'New Lead Assigned', message: 'A new lead "{customerName}" has been routed to you. SLA: {sla}h' },
    hi: { title: 'नया लीड सौंपा गया', message: 'आपको एक नया लीड "{customerName}" सौंपा गया है।' },
    mr: { title: 'नवीन लीड नियुक्त', message: 'तुम्हाला नवीन ग्राहक लीड "{customerName}" नियुक्त करण्यात आला आहे.' },
  },
  [NOTIFICATION_TYPES.SITE_VISIT_REQUESTED]: {
    en: { title: 'Site Visit Requested', message: '{customerName} requested a site visit for "{title}" on {date} at {slot}.' },
    hi: { title: 'साइट विजिट अनुरोध', message: '{customerName} ने "{title}" के लिए साइट विजिट का अनुरोध किया है।' },
    mr: { title: 'साइट भेट विनंती', message: '{customerName} यांनी "{title}" साठी प्रत्यक्ष भेटीची विनंती केली आहे.' },
  },
};

/**
 * Send an in-app notification with optional multi-channel dispatch
 */
const sendNotification = async ({
  recipientId,
  type,
  params = {},
  data = {},
  lang = 'en',
}) => {
  try {
    const templateGroup = TEMPLATES[type] || {
      en: { title: 'Notification', message: 'You have a new update.' },
    };
    const template = templateGroup[lang] || templateGroup['en'];

    let title = template.title;
    let message = template.message;

    // Substitute parameters
    Object.keys(params).forEach((key) => {
      title = title.replace(new RegExp(`{${key}}`, 'g'), params[key] || '');
      message = message.replace(new RegExp(`{${key}}`, 'g'), params[key] || '');
    });

    const notif = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    return notif;
  } catch (err) {
    console.error('[Notification Dispatch Error]:', err.message);
    return null;
  }
};

module.exports = {
  sendNotification,
};

