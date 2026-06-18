async function main() {
  const r = await fetch("http://localhost:3000/");
  const content = await r.text();
  console.log("len=" + content.length);
  console.log("button=" + content.includes('aria-label="Open CareerBridge AI"'));
  console.log("z50=" + content.includes("fixed bottom-6 right-6 z-50"));
  console.log("welcome=" + content.includes("CareerBridge AI. Ask me about"));
  console.log("hero_faster=" + content.includes("faster"));
  console.log("hero_search=" + content.includes("Search by title"));
  console.log("hero_popular=" + content.includes("Popular:"));
}
main();