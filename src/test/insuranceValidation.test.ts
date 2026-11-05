import { expect,it } from 'vitest';
import { assertCalendarInsurance } from '../../supabase/functions/_shared/insurance-validation';
const item:any={product_name:'TEST',quantity:6,articles:1,unit:'Kalendertage',unit_price:100,discount_percent:20};
const addon:any={key:'maschinenbruch',label:'Maschinenbruchversicherung',note:'Selbstbehalt 750 €',price_type:'per_unit',rate:12,basis:'full_period',days:6,amount:72,manual:true};
it('accepts six calendar days at 12 euros with 750 euros deductible',()=>expect(()=>assertCalendarInsurance([{...item,addons:[addon]}])).not.toThrow());
it('rejects a legacy flat insurance without rewriting its price',()=>expect(()=>assertCalendarInsurance([{...item,addons:[{...addon,price_type:'flat',basis:'once'}]}])).toThrow('Pauschale'));
it('rejects missing deductible instead of inventing it',()=>expect(()=>assertCalendarInsurance([{...item,addons:[{...addon,note:''}]}])).toThrow('Selbstbehalt'));
it('rejects manual inconsistent amount despite manual flag',()=>expect(()=>assertCalendarInsurance([{...item,addons:[{...addon,amount:73}]}])).toThrow('Versicherungssumme'));
it.each([null,0,1.5,3661])('rejects invalid calendar-day count %s',days=>expect(()=>assertCalendarInsurance([{...item,addons:[{...addon,days}]}])).toThrow('Kalendertage'));