import { fetchSchoolsWithQuery, IscoolClassLookup } from '@yanshoof/iscool'

describe("Checks env variables and fetch are working", () => {
    it("Checks env variables", () => {
        expect(process.env.BASE_URL).toBeTruthy();
        expect(process.env.TOKEN).toBeTruthy();
    })
    it("Fetches a simple fetch", async () => {
        const res = await fetchSchoolsWithQuery(460030);
        expect(res.Schools.length).toBeGreaterThan(0);
    })
    it("Fetches a class fetch", async () => {
        const lookup = await IscoolClassLookup.fromSchool("460030");
        expect(lookup.gradeSize).toBeGreaterThan(0);
    })
})