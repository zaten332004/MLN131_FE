export default function handler(_req: any, res: any) {
  res.statusCode = 404;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ message: "Uploads are not configured for this deployment." }));
}
