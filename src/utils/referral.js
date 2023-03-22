const serviceRequestPayload = {
  resourceType: 'ServiceRequest',
  status: 'active',
  intent: 'order',
  category: [
    {
      coding: [
        {
          system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '25273',
          display: 'PIH HUM Ortho Procedures'
        }
      ],
      text: 'Procedure'
    }
  ],
  code: {
    coding: [
      {
        system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
        code: '25116',
        display: 'Manipulation of knee joint under anesthesia'
      }
    ],
    text: 'Manipulation of knee joint under anesthesia'
  },
  priority: 'urgent',
  subject: {
    reference: 'Patient/MOH1664351915',
    display: 'John Doe'
  },
  occurrenceDateTime: '2016-09-27',
  authoredOn: '2016-09-20',
  requester: {
    reference: 'PractitionerRole/123456'
  },
  performer: [
    {
      reference: 'Organization/13023'
    }
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'https://nhdd-api.health.go.ke/orgs/MOH-KENYA/sources/nhdd/',
          code: '25652',
          display: 'Problem Knee'
        }
      ]
    }
  ],
  note: [
    {
      text: 'Any additional text that needs to be sent'
    }
  ]
};

const extractCommunityPayload = () => {
};

const transformCommunityPayload = () => {
};

const loadCommunityPayload = () => {
};

module.exports = {
  extractCommunityPayload,
  transformCommunityPayload,
  loadCommunityPayload
}
