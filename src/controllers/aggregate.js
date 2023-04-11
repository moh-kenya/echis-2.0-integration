const {pool, dataQuery} = require('../utils/aggregate');
const {DateTime} = require('luxon');
const axios = require('axios');

const getMoh515Data = (request, response) => {
  pool.query(dataQuery, (error, results) => {
    if (error) {
      throw error;
    }
    let result = results.rows;
    result = result.map(obj => {
      obj.chu_code = chus.chu_code;
      obj.period_start = DateTime.fromJSDate(obj.period_start).plus({days: 1}).startOf('month').toISODate(); //todo: thandle this in postgres
      return  renameKeys(dataElementsMapping, obj);
    });
    response.send(result);
    sendMoh515Data(convertToDhis(result));
  });
};

const PeriodDate_year = new Date().getFullYear();
const PeriodDate_month = new Date().getMonth();
const PeriodDate_monthString =
String(PeriodDate_month).length == 1
  ? '0' + PeriodDate_month
  : PeriodDate_month;
const dhisMonth = PeriodDate_year + '' + PeriodDate_monthString;
const periodStartMonth = PeriodDate_year + '-' +PeriodDate_monthString + '-' + '01'  ;
const payload = {
  dryRun: false,
  dataSet: 'ovtKPo15xAg',
  attributeOptionCombo: '',
  dataValues: [],
};

const convertToDhis = (dataI) => {
  console.log(dataI);
  data_le = dataI.length;
  if (data_le < 1) {
    return {response: 'No dataI'};
  } else {
    const header = Object.keys(dataI[0]);
    const pePosition = header.indexOf(
      header.find((ele) => ele.toLowerCase().includes('period'))
    );
    const chuCode = header.indexOf(
      header.find((ele) => ele.toLowerCase().includes('chu_code'))
    );
    const dataStart =
      header.indexOf(
        header.find((ele) => ele.toLowerCase().includes('facility_join_field'))
      ) + 1;
    const rowEnd = header.length;

    const currentRowData = dataI.filter(
      (ele) => ele.period_start === periodStartMonth
    );
    // console.log(currentRowData)
    if (currentRowData != undefined) {
      currentRowData.map((rowData) => {
        for (let i = dataStart; i < rowEnd; i++) {
          dataEle = header[i];
          valuesData = {
            period: dhisMonth,
            orgUnit: rowData.chu_code,
            dataElement: dataEle,
            categoryOptionCombo: '',
            value: rowData[dataEle],
          };
          payload.dataValues.push(valuesData);
        }
      });
    }
    face = payload.dataValues;
    console.log({
      pePosition,
      chuCode,
      dataStart,
      rowEnd,
      periodStartMonth,
      currentRowData,
      dhisMonth,
      face,
      payload
    });
  }

  return payload;
};

const sendMoh515Data = async (data) => {
  const res = await axios.post('https://interoperabilitylab.uonbi.ac.ke/interop/mediator/emiddleware', data, {
    auth: {username: '<username>', password: '<password>'},
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res;
};

const chus = {
  chu_code: 'vJfBQhxz2P0'
};

const renameKeys = (keysMap, obj) =>
  Object.keys(obj).reduce(
    (acc, key) => {
      return {
        ...acc,
        ...{[keysMap[key] || key]: obj[key]}
      };
    },
    {}
  );
//todo: this dataElementsMapping mapping to be done in the database
const dataElementsMapping = {
  count_new_households_visited_safe_water_new_visit: 'OXgWwVp4SLi',
  count_households_hand_washing_facilities_new_visit: 'zhwGF3FDj8B',
  count_households_functional_latrines_new_visit: 'b16FHzbfVUe',
  count_newborns_within_48_hours_of_delivery: 'NjcDm9nopWu',
  count_children_12_59_months_dewormed: 'vAkP6k0yZDk',
  count_pregnant_women_referred_to_health_facility: 'VrpxWLhfIr6',
  count_new_deliveries_at_health_facility: 'fdsnixQkKCY',
  count_children_0_11_months_referred_immunization: 'ZkAL6i7sS2S',
  count_persons_referred_hts: 'zbYf5G3P7Fv',
  count_persons_referred_comprehensive_geriatric_services: 'hYPcrC46URl',
  count_persons_referred_diabetes: 'umcBUHyhuTc',
  count_persons_referred_cancer: 'SnP5Qr06tLy',
  count_persons_referred_mental_illness: 'd0XSdWwIlCU',
  count_persons_referred_hypertension: 'v9HafndlV8q',
  count_defaulters_immunization_referred: 'KHfPfnhSjmA',
  count_deaths_12_59_months: 'sXPwrF8r04E',
  count_deaths_maternal: 'Gx1XLLsvwAZ',
  count_households_visited_new_visit: 'LGsW5FyZFwZ',
  count_households_visited_revisit: 'vGvOtbvhclF',
  count_households_new_visit_upto_date_insurance: 'z9qwgod3UiG',
  count_households_new_visit_upto_date_insurance_uhc: 'd0zEtbkJnel',
  count_households_new_visit_upto_date_insurance_nhif: 'xXhZ15pqy4p',
  count_households_new_visit_upto_date_insurance_others: 'KiKtdZ5rV5d',
  count_households_new_visit_refuse_disposal: 'lhkXObzaWr3',
  count_women_15_49_years_counselled_fp: 'qNoOzWtEpuD',
  count_women_15_49_years_provided_fp: 'bbrNRV9zwVa',
  count_women_15_49_years_referred_fp: 'TLKNYG2xGad',
  count_women_pregnant: 'NvUUbEhFVcO',
  count_women_pregnant_underage: 'h9VcGyaQkfZ',
  count_women_pregnant_counselled_anc: 'LHd6A9RtHRF',
  count_new_deliveries: 'jx879BUZ39L',
  count_new_deliveries_at_home: 'X9d8oaBHDqx',
  count_new_deliveries_underage: 'vB85yqSN4gx',
  count_new_mothers_visited_within_48_hours_of_delivery: 'tuIDKhqDdcB',
  count_new_deliveries_at_home_referred_pnc: 'JrdSl1ADdBC',
  count_children_6_59_months_malnutrition_severe: 'idiiaWIh2qi',
  count_children_6_59_months_malnutrition_moderate: 'ekh0oJidJ38',
  count_children_6_59_months_referred_vitamin_a: 'ksINuMMr419',
  count_children_0_59_months_referred_delayed_milestones: 'dmU5MIrpsP7',
  count_defaulters_art_referred: 'TfmOlLMrQc6',
  count_defaulters_hei_referred: 'yHBk3iXClvx',
  count_defaulters_art_traced_referred: 'q90IMsLpFO4',
  count_defaulters_hei_traced_referred: 'rdJBPSOGJlA',
  count_persons_screened_tb: 'NjCLHbMeaNw',
  count_persons_presumptive_tb_referred: 'eLMPka37L2p',
  count_persons_presumptive_tb_referred_confirmed: 'HHyDcD7IjqT',
  count_persons_presumptive_tb_referred_confirmed_referred: 'siQaAwG3fiQ',
  count_cases_tb_confirmed_0_59_months: 'RhriKmKbHuH',
  count_treatment_interruptors_tb: 'XP1JclLpKdP',
  count_treatment_interrupters_tb_traced: 'mOoe88OmCct',
  count_women_15_49_years_referred_fp_completed: 'RivX8a7SDU3',
  count_women_pregnant_referred_anc_completed: 'wYD1JE3Tgsu',
  count_women_referred_pnc_completed: 'vyCCWAqAP5x',
  count_defaulters_immunization_referred_completed: 'XDgpSRb8Ofv',
  count_persons_referred_hts_completed: 'QAKpLg7iZEJ',
  count_defaulters_art_referred_completed: 'iJpuwr4Hqj1',
  count_defaulters_hei_referred_completed: 'r1ed7zn2Q0a',
  count_routine_checkup_referred_completed: 'ylvw7Y1OB1H',
  count_persons_presumptive_tb_referred_completed: 'HC2a1iMVGPv',
  count_persons_presumptive_tb_contacts_referred_completed: 'Qr3F0zbsMmN',
  count_cases_tb_0_59_months_ipt_referred_completed: 'RlDNgxU0gn3',
  count_treatment_interruptors_tb_referred_completed: 'RKBTMciF0Tk',
  count_cases_0_59_months_fever_lt_7_days: 'gpYrkLhO4wB',
  count_cases_0_59_months_fever_lt_7_days_rdt: 'RXgNfdYSJPh',
  count_cases_0_59_months_fever_lt_7_days_rdt_positive: 'eUakxWsxkcq',
  count_cases_0_59_months_fever_lt_7_days_rdt_positive_act: 'V9SqzZHKoP7',
  count_cases_2_59_months_fast_breathing: 'WBTvg49kJHr',
  count_cases_2_59_months_fast_breathing_amoxycillin: 'wMQolZyIR5P',
  count_cases_2_59_months_diarrhea: 'V00z4bQRaqe',
  count_cases_2_59_months_diarrhea_zinc_ors: 'AR3WCfcKDwX',
  count_cases_gte_60_months_fever_lt_7_days: 'YCWGGPn7tdl',
  count_cases_gte_60_months_fever_lt_7_days_rdt: 'ZAsCMIJLkvj',
  count_cases_gte_60_months_fever_lt_7_days_rdt_positive: 'QfBRPj1q0W1',
  count_cases_gte_60_months_fever_lt_7_days_rdt_positive_act: 'oVxxa344TPs',
  count_deaths_0_28_days: 'bWTVzXQoxpt',
  count_deaths_29_days_11_months: 'I9yVwu1FWu6',
  count_deaths_6_59_years: 'jBYvAmDdyfY',
  count_deaths_gt_60_years: 'zW17XEoFhAN',
  count_households: 'rdcZ1ni3jrD',
  count_community_dialogue_days: 'Y0ZpWnkp4v9',
  count_community_action_days: 'ybfaTwL9yBA',
  count_community_monthly_meetings: 'aod6Gz2QUg2'
};

module.exports = {
  getMoh515Data
};
