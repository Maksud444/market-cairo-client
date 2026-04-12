export const categoryConfig = {
  'Mobile & Tablets': {
    icon: '📱',
    fields: [
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'select', options: [
        'Apple','Samsung','Xiaomi','Huawei','Oppo','Vivo','Realme','OnePlus','Google',
        'Nokia','Motorola','Sony','Tecno','Infinix','Itel','Redmi','Lava','Honor',
        'Lenovo','Poco','HTC','Meizu','ZTE','AGM','Alcatel','Archos','Asus','BlackBerry',
        'Blackview','BLU','BQ','Cat','Coolpad','Cubot','Doogee','Elephone','Energizer',
        'Fairphone','Gionee','Karbonn','LeEco','Micromax','Nothing','Oukitel','Panasonic',
        'Philips','Prestigio','Sharp','TCL','Ulefone','Umidigi','Vertu','Wiko','Yota','Other'
      ] },
      { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', placeholder: 'e.g. iPhone 14 Pro' },
      { key: 'storage', label: 'Storage', labelAr: 'المساحة', type: 'select', options: ['8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
      { key: 'ram', label: 'RAM', labelAr: 'الرام', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', 'Other'] },
    ]
  },
  'Electronics': {
    icon: '💻',
    fields: [
      { key: 'type', label: 'Type', labelAr: 'النوع', type: 'select', options: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Gaming PC', 'Graphics Card', 'Processor', 'RAM', 'Hard Drive / SSD', 'Keyboard', 'Mouse', 'Accessories', 'Other'] },
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'text', placeholder: 'e.g. Dell, HP, Asus' },
      { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', placeholder: 'e.g. Inspiron 15 3000' },
    ]
  },
  'Fashion & Beauty': {
    icon: '👗',
    fields: [
      { key: 'type', label: 'Type', labelAr: 'النوع', type: 'select', options: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Shoes', 'Bags & Accessories', 'Watches', 'Jewelry', 'Beauty & Skincare', 'Other'] },
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'text', placeholder: 'e.g. Zara, H&M' },
      { key: 'size', label: 'Size', labelAr: 'المقاس', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size', 'Other'] },
    ]
  },
  'Furniture': {
    icon: '🛋️',
    fields: [
      { key: 'type', label: 'Type', labelAr: 'النوع', type: 'select', options: ['Sofa', 'Bed', 'Dining Table', 'Wardrobe', 'Desk', 'Chair', 'Bookshelf', 'TV Stand', 'Other'] },
      { key: 'material', label: 'Material', labelAr: 'الخامة', type: 'select', options: ['Wood', 'Metal', 'Fabric', 'Leather', 'Plastic', 'Glass', 'Other'] },
      { key: 'color', label: 'Color', labelAr: 'اللون', type: 'text', placeholder: 'e.g. Brown, White' },
    ]
  },
  'Kitchen': {
    icon: '🍳',
    fields: [
      { key: 'type', label: 'Type', labelAr: 'النوع', type: 'select', options: ['Refrigerator', 'Washing Machine', 'Oven', 'Microwave', 'Blender', 'Coffee Machine', 'Air Fryer', 'Cookware', 'Other'] },
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'text', placeholder: 'e.g. Bosch, Samsung' },
    ]
  },
  'Books': {
    icon: '📚',
    fields: [
      { key: 'subject', label: 'Subject', labelAr: 'الموضوع', type: 'select', options: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Religion', 'Self-Help', 'Children', 'Education', 'Other'] },
      { key: 'language', label: 'Language', labelAr: 'اللغة', type: 'select', options: ['Arabic', 'English', 'French', 'Other'] },
    ]
  },
  'Other': {
    icon: '📦',
    fields: []
  },
  'Smart Watch & Band': {
    icon: '⌚',
    fields: [
      { key: 'brand', label: 'Brand', labelAr: 'الماركة', type: 'select', options: [
        'Apple','Samsung','Huawei','Xiaomi','Amazfit','Garmin','Fitbit','Honor','Realme',
        'Oppo','Noise','boAt','Fire-Boltt','Fossil','Mobvoi','Casio','Withings','Zeblaze',
        'Zebronics','Haylou','Imilab','Polar','Suunto','TAG Heuer','Timex','Skagen',
        'Michael Kors','Diesel','Emporio Armani','Montblanc','Hublot','Louis Vuitton',
        'Alcatel','Archos','Asus','Blackview','Cubot','Doogee','Energizer','Infinix',
        'Itel','Lenovo','Meizu','Micromax','Motorola','Nothing','OnePlus','Philips',
        'Redmi','Sony','Ulefone','Umidigi','Wiko','Yamay','Other'
      ]},
      { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', placeholder: 'e.g. Apple Watch Series 9' },
      { key: 'connectivity', label: 'Connectivity', labelAr: 'الاتصال', type: 'select', options: ['Bluetooth', 'Cellular + Bluetooth', 'GPS + Cellular', 'WiFi + Bluetooth'] },
    ]
  },
};

// 3-level location hierarchy for Cairo & Giza
export const locationHierarchy = [
  {
    en: 'East Cairo', ar: 'شرق القاهرة',
    cities: [
      { en: 'New Cairo', ar: 'القاهرة الجديدة', compounds: ['5th Settlement', 'Madinaty', 'Rehab City', 'Shorouk City', 'Mostakbal City', 'New Administrative Capital', 'Obour City', 'Badr City'] },
      { en: 'Nasr City', ar: 'مدينة نصر', compounds: ['Ard El Golf', 'City Stars Area', 'Abbas El Akkad', 'Makram Ebeid'] },
      { en: 'Heliopolis', ar: 'مصر الجديدة', compounds: ['Nozha', 'New Nozha', 'Sheraton', 'Gesr Al Suez'] },
    ]
  },
  {
    en: 'Central Cairo', ar: 'وسط القاهرة',
    cities: [
      { en: 'Downtown', ar: 'وسط البلد', compounds: ['Garden City', 'Kasr El Nil', 'Tahrir Area'] },
      { en: 'Zamalek', ar: 'الزمالك', compounds: [] },
      { en: 'Shubra', ar: 'شبرا', compounds: ['Rod al-Farag', 'Abasiya', 'Hadayek el-Kobba'] },
    ]
  },
  {
    en: 'South Cairo', ar: 'جنوب القاهرة',
    cities: [
      { en: 'Maadi', ar: 'المعادي', compounds: ['Zahraa Al Maadi', 'Degla', 'Corniche El Maadi'] },
      { en: 'Mokattam', ar: 'المقطم', compounds: ['Katameya', 'Old Cairo', 'Basateen', 'Helwan'] },
    ]
  },
  {
    en: 'Giza', ar: 'الجيزة',
    cities: [
      { en: 'Dokki', ar: 'الدقي', compounds: ['Mohandessin', 'Agouza', 'Faisal', 'Haram'] },
      { en: 'Sheikh Zayed', ar: 'الشيخ زايد', compounds: ['Beverly Hills', 'Zayed Regency', 'Al Motamayez'] },
      { en: '6th of October', ar: 'السادس من أكتوبر', compounds: ['Hadayek October', 'Andalus', 'New October'] },
    ]
  },
  {
    en: 'Other', ar: 'أخرى',
    cities: [
      { en: 'Other', ar: 'أخرى', compounds: [] }
    ]
  }
];
