import { FaPhoneAlt, FaEnvelope, FaQuestionCircle, FaComments, FaTicketAlt } from 'react-icons/fa';

const SupportSection = () => {
    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Support & Help</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Call Support */}
                <div className="flex items-start gap-4 p-5 border rounded-lg hover:shadow transition">
                    <FaPhoneAlt className="text-green-500 text-xl mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Call Us</h4>
                        <p className="text-gray-600 text-sm">+234 800 123 4567</p>
                    </div>
                </div>

                {/* Email Support */}
                <div className="flex items-start gap-4 p-5 border rounded-lg hover:shadow transition">
                    <FaEnvelope className="text-blue-500 text-xl mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Email Us</h4>
                        <p className="text-gray-600 text-sm">support@example.com</p>
                    </div>
                </div>

                {/* FAQs */}
                <div className="flex items-start gap-4 p-5 border rounded-lg hover:shadow transition">
                    <FaQuestionCircle className="text-yellow-500 text-xl mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800">FAQs</h4>
                        <p className="text-gray-600 text-sm">Read common questions and answers.</p>
                        <a href="/faq" className="text-sm text-blue-600 hover:underline">View FAQs</a>
                    </div>
                </div>

                {/* Live Chat */}
                <div className="flex items-start gap-4 p-5 border rounded-lg hover:shadow transition">
                    <FaComments className="text-purple-500 text-xl mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Live Chat</h4>
                        <p className="text-gray-600 text-sm">Get instant support from our team.</p>
                        <button className="mt-1 text-sm text-blue-600 hover:underline">Start Chat</button>
                    </div>
                </div>

                {/* Raise a Ticket */}
                <div className="flex items-start gap-4 p-5 border rounded-lg hover:shadow transition">
                    <FaTicketAlt className="text-red-500 text-xl mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Raise a Ticket</h4>
                        <p className="text-gray-600 text-sm">Facing an issue? Raise a support ticket.</p>
                        <a href="/support/create-ticket" className="text-sm text-blue-600 hover:underline">Create Ticket</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupportSection;
