import React from "react";
import "./VaccineGuidance.css";
import guidanceImg from "../../../assets/syringe.jpeg";
import PageHero from "../../../Components/PageHero/PageHero";
import Footer from "../../../Components/Footer/Footer";
import { HeartPulse } from "lucide-react";

const VaccineGuidance = () => {
  return (
    <div className="page-bg">
      {/* Hero Section */}
      <PageHero
        image={guidanceImg}
        title="Guidance"
        description="Understanding why vaccination matters and how it protects your child's future."
      />

      {/* Guidance Content */}
      <section className="guidance-content">
        <div className="guidance-card">
          <div className="guidance-icon">
            <HeartPulse size={28} color="#1e5f8e" />
          </div>
          <h2>Why Vaccination Matters</h2>

          <p>
            Vaccination is one of the most effective ways to protect children
            from serious and potentially life-threatening diseases. By
            introducing a small, controlled exposure to a pathogen, vaccines
            help the immune system learn to recognize and fight off the real
            infection before it can cause harm.
          </p>

          <p>
            Beyond protecting individual children, vaccination plays a vital
            role in community health. When a large portion of the population
            is immunized, it becomes much harder for diseases to spread,
            which helps protect infants, elderly people, and those with
            weakened immune systems who cannot be vaccinated themselves.
          </p>

          <p>
            Following the recommended vaccination schedule ensures that
            children receive protection at the right stages of development,
            when they are most vulnerable. Parents are encouraged to consult
            their pediatrician, keep vaccination records updated, and address
            any concerns with a trusted healthcare provider rather than
            delaying or skipping doses.
          </p>

          <p className="urdu-paragraph">
            بچوں کی ویکسینیشن ان طاقتور ترین ذرائع میں سے ایک ہے جو معصوم زندگیوں کو سنگین اور جان لیوا بیماریوں سے محفوظ رکھتی ہے۔ زندگی کے ابتدائی ہفتوں میں بچے کا مدافعتی نظام ابھی نشوونما پا رہا ہوتا ہے، جس کی وجہ سے وہ خسرہ، پولیو، تشنج اور کالی کھانسی جیسی بیماریوں کے لیے زیادہ حساس ہوتے ہیں۔ ویکسین جسم میں کمزور یا غیر فعال جراثیم کی تھوڑی اور محفوظ مقدار داخل کر کے مدافعتی نظام کو تربیت دیتی ہے تاکہ وہ اصل بیماری کے حملے سے پہلے ہی اسے پہچان کر اس کا مقابلہ کر سکے۔ اس سے نہ صرف ویکسین لگوانے والے بچے کی حفاظت ہوتی ہے بلکہ کمیونٹی، سکولوں اور خاندانوں میں بیماری کے پھیلاؤ کا خطرہ بھی کم ہوتا ہے، جسے ہرڈ امیونٹی کہا جاتا ہے۔ یہ ان شیر خوار بچوں اور کمزور مدافعتی نظام والے افراد کی بھی حفاظت کرتی ہے جنہیں ابھی ویکسین نہیں دی جا سکتی۔ متعدد طبی تحقیقات اور دہائیوں کے عالمی صحت کے اعداد و شمار نے ثابت کیا ہے کہ ویکسینز محفوظ، سختی سے آزمائی گئی، اور ان بیماریوں سے کہیں کم خطرناک ہیں جن سے یہ بچاؤ فراہم کرتی ہیں۔ ویکسینیشن میں تاخیر یا اسے نظرانداز کرنا بچوں کو ان بیماریوں کے سامنے بے یارومددگار چھوڑ سکتا ہے جو کبھی بچپن کی موت اور معذوری کی عام وجوہات تھیں، اور جو آج وسیع پیمانے پر ویکسینیشن کی بدولت نایاب ہو چکی ہیں۔ ماہرینِ اطفال اور صحت کے اداروں کی تجویز کردہ ویکسینیشن شیڈول پر عمل کرنے سے بچوں کو نشوونما کے درست مراحل پر تحفظ ملتا ہے، جو انہیں ایک صحت مند زندگی کی مضبوط بنیاد فراہم کرتا ہے۔
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VaccineGuidance;
