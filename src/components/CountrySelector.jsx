import { useRef } from 'react';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = 'AL DZ AD AO AI AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR VG BN BG BF BI KH CM CA CV KY CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GN GW GY HT HN HK HU IS IN ID IQ IE IL IT JM JP JO KZ KE KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MQ MR MU MX MD MC MN ME MS MA MZ MM NA NP NL NC NZ NI NE NG MK NO OM PK PS PA PG PY PE PH PL PT PR QA RE RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TC UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ').map(code => ({ code, name: regions.of(code) })).sort((a, b) => a.name.localeCompare(b.name));
const flag = code => [...code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');

export function CountrySelector({ country, onChange }) {
  const picker = useRef(null);
  return <details data-popover className="streaming-country-picker" ref={picker}>
    <summary aria-label="Choose streaming country"><span aria-hidden="true">{flag(country)}</span> {regions.of(country)} <span className="country-chevron" aria-hidden="true">▾</span></summary>
    <div className="country-menu" aria-label="Streaming countries">
      <div className="country-menu-heading">Where are you watching?<span>Cinema and streaming availability follows this choice.</span></div>
      <div className="country-options">{countries.map(({ code, name }) => <button type="button" key={code} aria-pressed={country === code} onClick={() => { onChange(code); picker.current.open = false; picker.current.querySelector('summary').focus(); }}><span aria-hidden="true">{flag(code)}</span><span>{name}</span>{country === code && <span aria-hidden="true">✓</span>}</button>)}</div>
    </div>
  </details>;
}
