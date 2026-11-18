const unavailable = () => Response.json(
  { error: "Paid plans are being prepared. You can use your own model API key in Settings." },
  { status: 503, headers: { "Cache-Control": "no-store" } },
);

export const POST = unavailable;
export const GET = unavailable;
