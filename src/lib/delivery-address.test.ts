import {expect,it} from 'vitest';
import {deliveryAddressSchema} from './delivery-address';
it('requires a real delivery address and Norwegian postal code before shipped purchases',()=>{
 expect(deliveryAddressSchema.safeParse({name:'Kevin Aleksandersen',line1:'Gateveien 1',postalCode:'7010',city:'Trondheim'}).success).toBe(true);
 expect(deliveryAddressSchema.safeParse({name:'',line1:'',postalCode:'7010',city:''}).success).toBe(false);
 expect(deliveryAddressSchema.safeParse({name:'Kevin Aleksandersen',line1:'Gateveien 1',postalCode:'701',city:'Trondheim'}).success).toBe(false);
});