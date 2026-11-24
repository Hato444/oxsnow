export async function saveServiceEnquiry(query, id, enquiry, now) {
  const { service, name, email, phone, budget, timeline, details } = enquiry;
  await query(`INSERT INTO service_enquiries (id,service,name,email,phone,budget,timeline,details,created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, service, name, email, phone, budget, timeline, JSON.stringify(details), now]);
}
