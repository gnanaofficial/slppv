import React from "react";
import SEO from "../components/common/SEO";
import { Container } from "@mui/material";

const TermsAndConditions = () => {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy Temple"
        keywords="Terms, Conditions, Temple, Rules, Regulations"
      />
      <Container maxWidth="lg">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-primaryColor border-b pb-4">
            Terms and Conditions
          </h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                1. General Information
              </h2>
              <p>
                Welcome to the official website of Sri Lakshmi Padmavathi Sameta
                Sri Prasanna Venkateswara Swamy Temple. By accessing this
                website, you agree to comply with and be bound by the following
                terms and conditions of use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                2. Donations and Sevas
              </h2>
              <p>
                All donations made through this website are voluntary. The
                temple administration ensures that the funds are utilized for
                the intended purpose of temple maintenance, annadanam, and other
                charitable activities. Seva bookings are subject to
                availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                3. Refund Policy
              </h2>
              <p>
                Donations once made are generally non-refundable. However, in
                case of technical errors or duplicate transactions, please
                contact the temple administration within 7 days with proof of
                transaction for resolution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                4. Privacy
              </h2>
              <p>
                We respect your privacy. Any personal information collected
                during donation or seva booking (such as name, email, phone
                number) is used solely for record-keeping and communication
                regarding temple activities. We do not sell your data to third
                parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                5. Code of Conduct
              </h2>
              <p>
                Devotees are requested to maintain the sanctity of the temple
                and follow traditional dress codes and customs while visiting
                the temple or participating in online sevas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                6. Changes to Terms
              </h2>
              <p>
                The temple administration reserves the right to modify these
                terms and conditions at any time without prior notice. Continued
                use of the website signifies your acceptance of the updated
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2 text-secondaryColor">
                7. Contact Information
              </h2>
              <p>
                For any queries regarding these terms, please contact us at:
                <br />
                <strong>Email:</strong> info@slpptemple.org
                <br />
                <strong>Phone:</strong> +91 9492284523
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TermsAndConditions;
