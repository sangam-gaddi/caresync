import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import City from '@/lib/models/city';
import Hospital from '@/lib/models/hospital';
import Specialist from '@/lib/models/specialist';
import Slot from '@/lib/models/slot';

const citiesData = [
    { name: 'Mumbai' },
    { name: 'Bangalore' },
    { name: 'Delhi' },
    { name: 'Hyderabad' },
    { name: 'Pune' },
    { name: 'Chennai' },
    { name: 'Kolkata' },
    { name: 'Ahmedabad' },
];

const specialtiesList = ['Cardiology', 'Orthopedics', 'Neurology', 'Dermatology', 'General Medicine', 'Pediatrics', 'Oncology', 'Gynaecology', 'Urology', 'Gastroenterology'];

const hospitalsData = [
    // Mumbai
    { name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', rating: 4.8, address: 'Four Bungalows, Andheri West', lat: 19.1315, lng: 72.8256, specialties: ['Cardiology', 'Neurology', 'Oncology'] },
    { name: 'Lilavati Hospital', city: 'Mumbai', rating: 4.7, address: 'Bandra Reclamation, Bandra West', lat: 19.0505, lng: 72.8288, specialties: ['Cardiology', 'Orthopedics', 'General Medicine'] },
    { name: 'Jaslok Hospital', city: 'Mumbai', rating: 4.6, address: 'Pedder Road', lat: 18.9715, lng: 72.8090, specialties: ['Neurology', 'Gastroenterology', 'Urology'] },
    { name: 'Nanavati Max Super Specialty Hospital', city: 'Mumbai', rating: 4.5, address: 'Vile Parle West', lat: 19.0963, lng: 72.8385, specialties: ['Cardiology', 'Orthopedics', 'Pediatrics'] },
    { name: 'Hinduja Hospital', city: 'Mumbai', rating: 4.8, address: 'Mahim', lat: 19.0345, lng: 72.8396, specialties: ['Oncology', 'Neurology', 'General Medicine'] },
    { name: 'Breach Candy Hospital', city: 'Mumbai', rating: 4.7, address: 'Breach Candy', lat: 18.9734, lng: 72.8051, specialties: ['Cardiology', 'Gynaecology', 'Pediatrics'] },
    { name: 'S. L. Raheja Hospital', city: 'Mumbai', rating: 4.4, address: 'Mahim', lat: 19.0436, lng: 72.8427, specialties: ['Oncology', 'General Medicine'] },
    { name: 'Fortis Hospital', city: 'Mumbai', rating: 4.5, address: 'Mulund', lat: 19.1664, lng: 72.9431, specialties: ['Cardiology', 'Urology', 'Orthopedics'] },
    { name: 'Saifee Hospital', city: 'Mumbai', rating: 4.6, address: 'Charni Road', lat: 18.9532, lng: 72.8179, specialties: ['General Medicine', 'Neurology', 'Gynaecology'] },
    { name: 'Wockhardt Hospital', city: 'Mumbai', rating: 4.5, address: 'Mumbai Central', lat: 18.9729, lng: 72.8228, specialties: ['Cardiology', 'Orthopedics', 'Oncology'] },

    // Bangalore
    { name: 'Manipal Hospital', city: 'Bangalore', rating: 4.7, address: 'HAL Old Airport Rd, Kodihalli', lat: 12.9592, lng: 77.6480, specialties: ['Cardiology', 'Oncology', 'Neurology'] },
    { name: 'Fortis Hospital', city: 'Bangalore', rating: 4.6, address: 'Bannerghatta Main Rd', lat: 12.8943, lng: 77.5979, specialties: ['Orthopedics', 'Cardiology', 'Urology'] },
    { name: 'Narayana Health City', city: 'Bangalore', rating: 4.8, address: 'Bommasandra', lat: 12.8152, lng: 77.6833, specialties: ['Cardiology', 'Pediatrics', 'Gastroenterology'] },
    { name: 'Apollo Hospital', city: 'Bangalore', rating: 4.7, address: 'Bannerghatta Road', lat: 12.8953, lng: 77.5983, specialties: ['Neurology', 'Orthopedics', 'General Medicine'] },
    { name: 'Aster CMI Hospital', city: 'Bangalore', rating: 4.5, address: 'Hebbal', lat: 13.0483, lng: 77.5925, specialties: ['Oncology', 'Gynaecology', 'Urology'] },
    { name: 'Sakra World Hospital', city: 'Bangalore', rating: 4.6, address: 'Bellandur', lat: 12.9248, lng: 77.6853, specialties: ['Orthopedics', 'Neurology', 'Cardiology'] },
    { name: 'Sparsh Hospital', city: 'Bangalore', rating: 4.5, address: 'Yeshwanthpur', lat: 13.0232, lng: 77.5502, specialties: ['Orthopedics', 'General Medicine'] },
    { name: 'Columbia Asia (Manipal)', city: 'Bangalore', rating: 4.4, address: 'Whitefield', lat: 12.9738, lng: 77.7471, specialties: ['Gynaecology', 'Pediatrics', 'Oncology'] },
    { name: 'St. Johns Medical College Hospital', city: 'Bangalore', rating: 4.7, address: 'Koramangala', lat: 12.9323, lng: 77.6186, specialties: ['General Medicine', 'Urology', 'Dermatology'] },
    { name: 'BGS Gleneagles Global Hospital', city: 'Bangalore', rating: 4.6, address: 'Kengeri', lat: 12.9056, lng: 77.4984, specialties: ['Gastroenterology', 'Neurology', 'Cardiology'] },

    // Delhi
    { name: 'Apollo Hospital', city: 'Delhi', rating: 4.8, address: 'Sarita Vihar', lat: 28.5393, lng: 77.2843, specialties: ['Cardiology', 'Neurology', 'Oncology'] },
    { name: 'Max Super Speciality Hospital', city: 'Delhi', rating: 4.6, address: 'Saket', lat: 28.5273, lng: 77.2136, specialties: ['Orthopedics', 'Cardiology', 'Pediatrics'] },
    { name: 'Sir Ganga Ram Hospital', city: 'Delhi', rating: 4.8, address: 'Rajinder Nagar', lat: 28.6385, lng: 77.1895, specialties: ['General Medicine', 'Urology', 'Gastroenterology'] },
    { name: 'BLK-Max Super Speciality Hospital', city: 'Delhi', rating: 4.5, address: 'Pusa Road', lat: 28.6433, lng: 77.1804, specialties: ['Oncology', 'Orthopedics', 'Neurology'] },
    { name: 'Fortis Escorts Heart Institute', city: 'Delhi', rating: 4.9, address: 'Okhla', lat: 28.5606, lng: 77.2796, specialties: ['Cardiology', 'Pediatrics'] },
    { name: 'AIIMS Delhi (Private Wards)', city: 'Delhi', rating: 4.9, address: 'Ansari Nagar', lat: 28.5659, lng: 77.2111, specialties: ['Oncology', 'Neurology', 'General Medicine'] },
    { name: 'Moolchand Medcity', city: 'Delhi', rating: 4.4, address: 'Lajpat Nagar', lat: 28.5670, lng: 77.2344, specialties: ['Gynaecology', 'Orthopedics', 'Dermatology'] },
    { name: 'Venkateshwar Hospital', city: 'Delhi', rating: 4.5, address: 'Dwarka', lat: 28.5866, lng: 77.0390, specialties: ['Cardiology', 'Urology', 'General Medicine'] },
    { name: 'Batra Hospital', city: 'Delhi', rating: 4.3, address: 'Tughlakabad', lat: 28.5147, lng: 77.2435, specialties: ['Oncology', 'Neurology', 'Orthopedics'] },
    { name: 'Holy Family Hospital', city: 'Delhi', rating: 4.4, address: 'Okhla', lat: 28.5623, lng: 77.2736, specialties: ['General Medicine', 'Pediatrics', 'Gynaecology'] },

    // Hyderabad
    { name: 'Yashoda Hospitals', city: 'Hyderabad', rating: 4.7, address: 'Somajiguda', lat: 17.4262, lng: 78.4593, specialties: ['Cardiology', 'Oncology', 'Neurology'] },
    { name: 'Care Hospitals', city: 'Hyderabad', rating: 4.5, address: 'Banjara Hills', lat: 17.4150, lng: 78.4480, specialties: ['Cardiology', 'Orthopedics', 'Gastroenterology'] },
    { name: 'Apollo Hospitals', city: 'Hyderabad', rating: 4.8, address: 'Jubilee Hills', lat: 17.4215, lng: 78.4074, specialties: ['Neurology', 'Orthopedics', 'General Medicine'] },
    { name: 'KIMS Hospitals', city: 'Hyderabad', rating: 4.6, address: 'Secunderabad', lat: 17.4436, lng: 78.4839, specialties: ['Oncology', 'Cardiology', 'Pediatrics'] },
    { name: 'AIG Hospitals', city: 'Hyderabad', rating: 4.9, address: 'Gachibowli', lat: 17.4390, lng: 78.3616, specialties: ['Gastroenterology', 'Oncology', 'Urology'] },
    { name: 'Sunshine Hospitals', city: 'Hyderabad', rating: 4.5, address: 'Secunderabad', lat: 17.4385, lng: 78.4842, specialties: ['Orthopedics', 'Neurology', 'General Medicine'] },
    { name: 'Medicover Hospitals', city: 'Hyderabad', rating: 4.4, address: 'Hitec City', lat: 17.4483, lng: 78.3752, specialties: ['Cardiology', 'Gynaecology', 'Dermatology'] },
    { name: 'Basavatarakam Indo-American Cancer Hospital', city: 'Hyderabad', rating: 4.8, address: 'Banjara Hills', lat: 17.4162, lng: 78.4285, specialties: ['Oncology'] },
    { name: 'Star Hospitals', city: 'Hyderabad', rating: 4.5, address: 'Banjara Hills', lat: 17.4163, lng: 78.4411, specialties: ['Cardiology', 'Urology', 'Orthopedics'] },
    { name: 'Continental Hospitals', city: 'Hyderabad', rating: 4.6, address: 'Gachibowli', lat: 17.4342, lng: 78.3496, specialties: ['Neurology', 'Oncology', 'General Medicine'] },

    // Pune
    { name: 'Ruby Hall Clinic', city: 'Pune', rating: 4.6, address: 'Sassoon Rd', lat: 18.5303, lng: 73.8767, specialties: ['Cardiology', 'Oncology', 'Neurology'] },
    { name: 'Deenanath Mangeshkar Hospital', city: 'Pune', rating: 4.8, address: 'Erandwane', lat: 18.5034, lng: 73.8329, specialties: ['General Medicine', 'Neurology', 'Orthopedics'] },
    { name: 'Sahyadri Super Speciality Hospital', city: 'Pune', rating: 4.5, address: 'Deccan Gymkhana', lat: 18.5165, lng: 73.8370, specialties: ['Oncology', 'Cardiology', 'Gastroenterology'] },
    { name: 'Aditya Birla Memorial Hospital', city: 'Pune', rating: 4.6, address: 'Chinchwad', lat: 18.6300, lng: 73.7818, specialties: ['Orthopedics', 'Neurology', 'Pediatrics'] },
    { name: 'Jehangir Hospital', city: 'Pune', rating: 4.5, address: 'Sassoon Rd', lat: 18.5300, lng: 73.8753, specialties: ['General Medicine', 'Urology', 'Gynaecology'] },
    { name: 'Sancheti Hospital', city: 'Pune', rating: 4.7, address: 'Shivajinagar', lat: 18.5312, lng: 73.8552, specialties: ['Orthopedics', 'Neurology'] },
    { name: 'KEM Hospital', city: 'Pune', rating: 4.4, address: 'Rasta Peth', lat: 18.5195, lng: 73.8687, specialties: ['General Medicine', 'Pediatrics', 'Oncology'] },
    { name: 'Manipal Hospital', city: 'Pune', rating: 4.5, address: 'Baner', lat: 18.5606, lng: 73.7865, specialties: ['Cardiology', 'Orthopedics', 'Urology'] },
    { name: 'Inamdar Multispeciality Hospital', city: 'Pune', rating: 4.3, address: 'Fatima Nagar', lat: 18.5020, lng: 73.9056, specialties: ['Neurology', 'General Medicine', 'Dermatology'] },
    { name: 'Noble Hospital', city: 'Pune', rating: 4.5, address: 'Hadapsar', lat: 18.5132, lng: 73.9317, specialties: ['Cardiology', 'Orthopedics', 'Oncology'] },

    // Chennai
    { name: 'Apollo Hospitals', city: 'Chennai', rating: 4.8, address: 'Greams Road', lat: 13.0617, lng: 80.2483, specialties: ['Cardiology', 'Neurology', 'Oncology'] },
    { name: 'MIOT India', city: 'Chennai', rating: 4.7, address: 'Manapakkam', lat: 13.0181, lng: 80.1764, specialties: ['Orthopedics', 'Cardiology', 'General Medicine'] },
    { name: 'Fortis Malar Hospital', city: 'Chennai', rating: 4.5, address: 'Adyar', lat: 13.0031, lng: 80.2562, specialties: ['Neurology', 'Urology', 'Pediatrics'] },
    { name: 'Billroth Hospitals', city: 'Chennai', rating: 4.4, address: 'Shenoy Nagar', lat: 13.0766, lng: 80.2241, specialties: ['Oncology', 'Gastroenterology', 'General Medicine'] },
    { name: 'Gleneagles Global Health City', city: 'Chennai', rating: 4.6, address: 'Perumbakkam', lat: 12.8998, lng: 80.1865, specialties: ['Neurology', 'Oncology', 'Orthopedics'] },
    { name: 'Kauvery Hospital', city: 'Chennai', rating: 4.6, address: 'Alwarpet', lat: 13.0336, lng: 80.2520, specialties: ['Cardiology', 'Neurology', 'Pediatrics'] },
    { name: 'Sri Ramachandra Medical Centre', city: 'Chennai', rating: 4.7, address: 'Porur', lat: 13.0354, lng: 80.1472, specialties: ['General Medicine', 'Orthopedics', 'Oncology'] },
    { name: 'Vijaya Hospital', city: 'Chennai', rating: 4.5, address: 'Vadapalani', lat: 13.0485, lng: 80.2119, specialties: ['Cardiology', 'Gynaecology', 'Dermatology'] },
    { name: 'Sims Hospital', city: 'Chennai', rating: 4.6, address: 'Vadapalani', lat: 13.0478, lng: 80.2078, specialties: ['Orthopedics', 'Gastroenterology', 'Neurology'] },
    { name: 'MGM Healthcare', city: 'Chennai', rating: 4.7, address: 'Aminjikarai', lat: 13.0732, lng: 80.2185, specialties: ['Cardiology', 'Oncology', 'General Medicine'] },

    // Kolkata
    { name: 'Apollo Gleneagles Hospitals', city: 'Kolkata', rating: 4.7, address: 'Salt Lake', lat: 22.5699, lng: 88.4060, specialties: ['Cardiology', 'Orthopedics', 'Oncology'] },
    { name: 'AMRI Hospitals', city: 'Kolkata', rating: 4.5, address: 'Dhakuria', lat: 22.5158, lng: 88.3653, specialties: ['Neurology', 'Cardiology', 'General Medicine'] },
    { name: 'Fortis Hospital', city: 'Kolkata', rating: 4.6, address: 'Anandapur', lat: 22.5188, lng: 88.4024, specialties: ['Orthopedics', 'Urology', 'Neurology'] },
    { name: 'Medica Superspecialty Hospital', city: 'Kolkata', rating: 4.6, address: 'Mukundapur', lat: 22.4922, lng: 88.4017, specialties: ['Cardiology', 'Gastroenterology', 'Oncology'] },
    { name: 'Peerless Hospital', city: 'Kolkata', rating: 4.4, address: 'Panchasayar', lat: 22.4844, lng: 88.3970, specialties: ['General Medicine', 'Pediatrics', 'Orthopedics'] },
    { name: 'Ruby General Hospital', city: 'Kolkata', rating: 4.5, address: 'Kasba', lat: 22.5135, lng: 88.4036, specialties: ['Oncology', 'Neurology', 'Gynaecology'] },
    { name: 'Woodlands Multispeciality Hospital', city: 'Kolkata', rating: 4.6, address: 'Alipore', lat: 22.5310, lng: 88.3304, specialties: ['Cardiology', 'Orthopedics', 'General Medicine'] },
    { name: 'BM Birla Heart Research Centre', city: 'Kolkata', rating: 4.7, address: 'Alipore', lat: 22.5330, lng: 88.3315, specialties: ['Cardiology'] },
    { name: 'Desun Hospital', city: 'Kolkata', rating: 4.4, address: 'Kasba', lat: 22.5156, lng: 88.4045, specialties: ['Neurology', 'Orthopedics', 'Urology'] },
    { name: 'Narayan Memorial Hospital', city: 'Kolkata', rating: 4.5, address: 'Behala', lat: 22.4938, lng: 88.3182, specialties: ['General Medicine', 'Oncology', 'Pediatrics'] },

    // Ahmedabad
    { name: 'Apollo Hospitals', city: 'Ahmedabad', rating: 4.7, address: 'Bhat', lat: 23.1166, lng: 72.6133, specialties: ['Cardiology', 'Orthopedics', 'Oncology'] },
    { name: 'Zydus Hospitals', city: 'Ahmedabad', rating: 4.8, address: 'SG Highway', lat: 23.0566, lng: 72.5204, specialties: ['Neurology', 'Cardiology', 'General Medicine'] },
    { name: 'Sterling Hospital', city: 'Ahmedabad', rating: 4.6, address: 'Gurukul', lat: 23.0441, lng: 72.5332, specialties: ['Oncology', 'Gastroenterology', 'Orthopedics'] },
    { name: 'CIMS Hospital', city: 'Ahmedabad', rating: 4.7, address: 'Science City Road', lat: 23.0768, lng: 72.5147, specialties: ['Cardiology', 'Neurology', 'Urology'] },
    { name: 'Shalby Hospitals', city: 'Ahmedabad', rating: 4.6, address: 'SG Highway', lat: 23.0232, lng: 72.5085, specialties: ['Orthopedics', 'General Medicine'] },
    { name: 'KD Hospital', city: 'Ahmedabad', rating: 4.7, address: 'SG Highway', lat: 23.1378, lng: 72.5276, specialties: ['Oncology', 'Pediatrics', 'Neurology'] },
    { name: 'HCG Cancer Centre', city: 'Ahmedabad', rating: 4.5, address: 'Sola', lat: 23.0713, lng: 72.5186, specialties: ['Oncology'] },
    { name: 'Narayana Multispeciality Hospital', city: 'Ahmedabad', rating: 4.6, address: 'Rakhiyal', lat: 23.0245, lng: 72.6186, specialties: ['Cardiology', 'Orthopedics', 'General Medicine'] },
    { name: 'Global Hospital', city: 'Ahmedabad', rating: 4.4, address: 'Sindhu Bhavan Marg', lat: 23.0373, lng: 72.5126, specialties: ['Gynaecology', 'Neurology', 'Urology'] },
    { name: 'Epic Hospital', city: 'Ahmedabad', rating: 4.5, address: 'SG Highway', lat: 23.0515, lng: 72.5215, specialties: ['Gastroenterology', 'General Medicine', 'Orthopedics'] },
];

const doctorNames = ['Dr. Rahul Sharma', 'Dr. Priya Patel', 'Dr. Amit Kumar', 'Dr. Sneha Gupta', 'Dr. Vikram Singh', 'Dr. Neha Reddy', 'Dr. Aditya Desai', 'Dr. Pooja Verma'];

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Seed script not available in production' }, { status: 403 });
    }

    try {
        await connectDB();
        console.log('Connected to MongoDB. Starting seed...');

        const createdCities = [];
        for (const city of citiesData) {
            const newCity = await City.findOneAndUpdate(
                { name: city.name },
                city,
                { upsert: true, new: true }
            );
            createdCities.push(newCity);
        }
        const cityMap = new Map(createdCities.map(c => [c.name, c._id]));

        let totalDocs = 0;
        let totalSlots = 0;

        for (const h of hospitalsData) {
            const cityId = cityMap.get(h.city);
            const hospitalDoc = await Hospital.findOneAndUpdate(
                { name: h.name, cityId },
                {
                    name: h.name, cityId, rating: h.rating, address: h.address,
                    lat: h.lat, lng: h.lng, specialties: h.specialties || specialtiesList
                },
                { upsert: true, new: true }
            );

            const numDocs = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numDocs; i++) {
                const docName = doctorNames[Math.floor(Math.random() * doctorNames.length)] + ' ' + String.fromCharCode(65 + i);
                const special = (h.specialties && h.specialties.length > 0) ? h.specialties[Math.floor(Math.random() * h.specialties.length)] : specialtiesList[Math.floor(Math.random() * specialtiesList.length)];

                let department = 'Primary Care';
                if (special === 'Cardiology') department = 'Heart & Vascular';
                if (special === 'Neurology') department = 'Brain & Spine';
                if (special === 'Orthopedics') department = 'Bones & Joints';
                if (special === 'Dermatology') department = 'Skin & Aesthetics';
                if (special === 'Oncology') department = 'Cancer Care';
                if (special === 'Gynaecology') department = 'Women Health';
                if (special === 'Urology') department = 'Kidney & Urology';
                if (special === 'Gastroenterology') department = 'Digestive Health';

                const specialist = await Specialist.findOneAndUpdate(
                    { name: docName, hospitalId: hospitalDoc._id },
                    {
                        name: docName,
                        specialty: special,
                        department: department,
                        experience: Math.floor(Math.random() * 20) + 5,
                        hospitalId: hospitalDoc._id,
                        rating: Number((Math.random() * 1 + 4).toFixed(1)),
                        reviewCount: Math.floor(Math.random() * 200) + 20,
                        consultationFee: Math.floor(Math.random() * 10) * 100 + 500,
                        type: Math.random() > 0.5 ? 'both' : (Math.random() > 0.5 ? 'in-person' : 'virtual'),
                        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter(() => Math.random() > 0.3),
                        avatar: "👨‍⚕️"
                    },
                    { upsert: true, new: true }
                );
                totalDocs++;

                const today = new Date();
                const slotsToCreate = [];
                for (let day = 1; day <= 5; day++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() + day);
                    const dayStr = d.toISOString().split('T')[0];

                    slotsToCreate.push({ specialistId: specialist._id, date: dayStr, time: "10:00 AM", status: "available" });
                    slotsToCreate.push({ specialistId: specialist._id, date: dayStr, time: "11:30 AM", status: "available" });
                    slotsToCreate.push({ specialistId: specialist._id, date: dayStr, time: "02:00 PM", status: "available" });
                    slotsToCreate.push({ specialistId: specialist._id, date: dayStr, time: "04:30 PM", status: "available" });
                }

                for (const slot of slotsToCreate) {
                    const createdSlot = await Slot.findOneAndUpdate(
                        { specialistId: slot.specialistId, date: slot.date, time: slot.time },
                        slot,
                        { upsert: true, new: true }
                    );
                    if (createdSlot) totalSlots++;
                }
            }
        }

        return NextResponse.json({
            message: 'Successfully seeded database',
            stats: {
                cities: createdCities.length,
                hospitals: hospitalsData.length,
                doctors: totalDocs,
                slots: totalSlots
            }
        });
    } catch (error) {
        console.error('Failed to seed:', error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
