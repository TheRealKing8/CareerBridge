/**
 * Top-100 most-leaked passwords (per SecLists / HaveIBeenPwned frequency
 * counts). We only need a small, opinionated blocklist — exhaustive
 * checks belong at the auth layer via k-anonymity to HIBP.
 *
 * Lowercased here so we can do case-insensitive matches against user
 * input without extra allocations.
 */
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345",
  "1234", "111111", "1234567", "dragon", "123123", "baseball", "abc123",
  "football", "monkey", "letmein", "696969", "shadow", "master", "666666",
  "qwertyuiop", "123321", "mustang", "1234567890", "michael", "654321",
  "pussy", "superman", "1qaz2wsx", "7777777", "fuckyou", "121212",
  "000000", "qazwsx", "123qwe", "killer", "trustno1", "jordan", "jennifer",
  "zxcvbnm", "asdfgh", "hunter", "buster", "soccer", "harley", "batman",
  "andrew", "tigger", "sunshine", "iloveyou", "fuckme", "2000", "charlie",
  "robert", "thomas", "hockey", "ranger", "daniel", "starwars", "klaster",
  "112233", "george", "asshole", "computer", "michelle", "jessica", "pepper",
  "1111", "zxcvbn", "555555", "11111111", "131313", "freedom", "777777",
  "pass", "fuck", "maggie", "159753", "aaaaaa", "ginger", "princess", "joshua",
  "cheese", "amanda", "summer", "love", "ashley", "6969", "nicole", "chelsea",
  "biteme", "matthew", "access", "yankees", "987654321", "dallas", "austin",
  "thunder", "taylor", "matrix", "william", "corvette", "hello", "martin",
  "heather", "secret", "fucker", "merlin", "diamond", "1234qwer", "gfhjkm",
  "hammer", "silver", "222222", "88888888", "anthony", "justin", "test",
  "bailey", "q1w2e3r4t5", "patrick", "internet", "scooter", "orange",
  "11111", "golfer", "cookie", "richard", "samantha", "bigdog", "guitar",
  "jackson", "whatever", "mickey", "chicken", "sparky", "snoopy", "maverick",
  "phoenix", "camaro", "sexy", "peanut", "morgan", "welcome", "falcon",
  "cowboy", "ferrari", "samsung", "andrea", "smokey", "steelers", "joseph",
  "mercedes", "dakota", "arsenal", "eagles", "melissa", "boomer", "booboo",
  "tigers", "purple", "amateur", "badboy", "spider", "james", "patricia",
  "lovers", "bronco", "success", "carter", "wolf", "madison", "butterfly",
  // Common base + digit variants (must include both letter AND digit to slip
  // past the regex check, so they need their own entries here).
  "password1", "password12", "password123", "qwerty1", "qwerty123", "qwerty1234",
  "abc1234", "abcd1234", "iloveyou1", "welcome1", "admin123", "letmein1",
  "monkey1", "dragon1", "master1", "login123",
]);