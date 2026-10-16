export type CountryCode = 'NG' | 'GH' | 'KE' | 'ZA' | 'GB' | 'US'

export type IdType = {
  value: string
  label: string
  placeholder: string
  hint: string
  pattern: RegExp
}

export type PayoutExtraField = {
  key: string
  label: string
  placeholder: string
  pattern: RegExp
  error: string
}

export type Country = {
  code: CountryCode
  name: string
  dialCode: string
  currency: string
  regionLabel: string
  regions: string[]
  idTypes: IdType[]
  banks: string[]
  accountNumber: { pattern: RegExp; placeholder: string; hint: string; canResolve: boolean }
  payoutExtra?: PayoutExtraField
}

export const countries: Country[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    currency: 'NGN',
    regionLabel: 'State',
    regions: [
      'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
      'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
      'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
      'Taraba', 'Yobe', 'Zamfara',
    ],
    idTypes: [
      { value: 'nin', label: 'National Identification Number (NIN)', placeholder: '12345678901', hint: '11 digits, found on your NIN slip or NIMC app', pattern: /^\d{11}$/ },
      { value: 'bvn', label: 'Bank Verification Number (BVN)', placeholder: '22123456789', hint: '11 digits. Dial *565*0# to retrieve yours', pattern: /^\d{11}$/ },
      { value: 'vin', label: "Voter's Card (PVC)", placeholder: '90F5B12345678901234', hint: '19-character Voter Identification Number', pattern: /^[A-Z0-9]{19}$/i },
      { value: 'dl', label: "Driver's Licence", placeholder: 'ABC12345AA01', hint: '12 characters as printed on your licence', pattern: /^[A-Z0-9]{12}$/i },
      { value: 'passport', label: 'International Passport', placeholder: 'A12345678', hint: 'A letter followed by 8 digits', pattern: /^[A-Z]\d{8}$/i },
    ],
    banks: [
      'Access Bank', 'Ecobank Nigeria', 'Fidelity Bank', 'First Bank of Nigeria', 'First City Monument Bank (FCMB)',
      'Guaranty Trust Bank (GTBank)', 'Keystone Bank', 'Kuda Microfinance Bank', 'Moniepoint MFB', 'OPay', 'PalmPay',
      'Polaris Bank', 'Providus Bank', 'Stanbic IBTC Bank', 'Sterling Bank', 'Union Bank of Nigeria',
      'United Bank for Africa (UBA)', 'Wema Bank', 'Zenith Bank',
    ],
    accountNumber: { pattern: /^\d{10}$/, placeholder: '0123456789', hint: '10-digit NUBAN account number', canResolve: true },
  },
  {
    code: 'GH',
    name: 'Ghana',
    dialCode: '+233',
    currency: 'GHS',
    regionLabel: 'Region',
    regions: [
      'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti',
      'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
    ],
    idTypes: [
      { value: 'ghana-card', label: 'Ghana Card', placeholder: 'GHA-123456789-0', hint: 'Format GHA-XXXXXXXXX-X', pattern: /^GHA-\d{9}-\d$/i },
      { value: 'passport', label: 'Passport', placeholder: 'G1234567', hint: 'A letter followed by 7 digits', pattern: /^[A-Z]\d{7}$/i },
      { value: 'voter', label: 'Voter ID', placeholder: '1234567890', hint: '10 digits', pattern: /^\d{10}$/ },
    ],
    banks: ['Absa Bank Ghana', 'CalBank', 'Ecobank Ghana', 'Fidelity Bank Ghana', 'GCB Bank', 'MTN Mobile Money', 'Stanbic Bank Ghana', 'Zenith Bank Ghana'],
    accountNumber: { pattern: /^\d{10,16}$/, placeholder: '1234567890123', hint: '10 to 16 digits', canResolve: false },
  },
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    currency: 'KES',
    regionLabel: 'County',
    regions: ['Kiambu', 'Kisumu', 'Machakos', 'Meru', 'Mombasa', 'Nairobi', 'Nakuru', 'Nyeri', 'Uasin Gishu', 'Other'],
    idTypes: [
      { value: 'national-id', label: 'National ID', placeholder: '12345678', hint: '7 or 8 digits', pattern: /^\d{7,8}$/ },
      { value: 'passport', label: 'Passport', placeholder: 'AK1234567', hint: '1–2 letters followed by 7 digits', pattern: /^[A-Z]{1,2}\d{7}$/i },
      { value: 'alien-id', label: 'Alien ID', placeholder: '123456789', hint: '9 digits', pattern: /^\d{9}$/ },
    ],
    banks: ['Absa Bank Kenya', 'Co-operative Bank', 'Equity Bank', 'KCB Bank', 'M-PESA', 'NCBA Bank', 'Stanbic Bank Kenya'],
    accountNumber: { pattern: /^\d{10,14}$/, placeholder: '0123456789012', hint: '10 to 14 digits', canResolve: false },
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    currency: 'ZAR',
    regionLabel: 'Province',
    regions: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
    idTypes: [
      { value: 'sa-id', label: 'South African ID', placeholder: '8001015009087', hint: '13-digit ID number', pattern: /^\d{13}$/ },
      { value: 'passport', label: 'Passport', placeholder: 'A12345678', hint: 'A letter followed by 8 digits', pattern: /^[A-Z]\d{8}$/i },
      { value: 'dl', label: "Driver's Licence", placeholder: '1234567890AB', hint: '12 characters', pattern: /^[A-Z0-9]{12}$/i },
    ],
    banks: ['Absa', 'Capitec Bank', 'FNB', 'Investec', 'Nedbank', 'Standard Bank', 'TymeBank'],
    accountNumber: { pattern: /^\d{9,11}$/, placeholder: '62123456789', hint: '9 to 11 digits', canResolve: false },
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    currency: 'GBP',
    regionLabel: 'Nation',
    regions: ['England', 'Northern Ireland', 'Scotland', 'Wales'],
    idTypes: [
      { value: 'passport', label: 'Passport', placeholder: '123456789', hint: '9 digits', pattern: /^\d{9}$/ },
      { value: 'dl', label: 'Driving Licence', placeholder: 'MORGA753116SM9IJ', hint: '16 characters', pattern: /^[A-Z0-9]{16}$/i },
      { value: 'brp', label: 'Biometric Residence Permit', placeholder: 'ZU1234567', hint: '2 letters followed by 7 digits', pattern: /^[A-Z]{2}\d{7}$/i },
    ],
    banks: ['Barclays', 'HSBC UK', 'Lloyds Bank', 'Monzo', 'NatWest', 'Revolut', 'Santander UK', 'Starling Bank'],
    accountNumber: { pattern: /^\d{8}$/, placeholder: '12345678', hint: '8-digit account number', canResolve: false },
    payoutExtra: { key: 'sortCode', label: 'Sort code', placeholder: '12-34-56', pattern: /^\d{2}-?\d{2}-?\d{2}$/, error: 'Enter a 6-digit sort code' },
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    currency: 'USD',
    regionLabel: 'State',
    regions: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
      'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
      'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming',
    ],
    idTypes: [
      { value: 'passport', label: 'U.S. Passport', placeholder: '123456789', hint: '9 characters', pattern: /^[A-Z0-9]{9}$/i },
      { value: 'dl', label: "Driver's License", placeholder: 'D1234567', hint: '6 to 15 characters', pattern: /^[A-Z0-9]{6,15}$/i },
      { value: 'state-id', label: 'State ID', placeholder: 'S1234567', hint: '6 to 15 characters', pattern: /^[A-Z0-9]{6,15}$/i },
    ],
    banks: ['Bank of America', 'Capital One', 'Chase', 'Citibank', 'PNC Bank', 'U.S. Bank', 'Wells Fargo'],
    accountNumber: { pattern: /^\d{4,17}$/, placeholder: '000123456789', hint: '4 to 17 digits', canResolve: false },
    payoutExtra: { key: 'routing', label: 'Routing number', placeholder: '021000021', pattern: /^\d{9}$/, error: 'Enter a 9-digit routing number' },
  },
]

export const getCountry = (code: string) => countries.find((c) => c.code === code) ?? countries[0]

export function yearsSince(isoDate: string) {
  if (!isoDate) return 0
  const d = new Date(isoDate)
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

export function maxBirthDate(minAge: number) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - minAge)
  return d.toISOString().slice(0, 10)
}
