
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckmarkIcon } from "@/components/ui/checkmark-icon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Target, 
  Users, 
  Award, 
  BookOpen, 
  Globe, 
  Lightbulb,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  GraduationCap,
  BarChart,
  UserCheck,
  Lock,
  Zap,
  MessageSquare,
  Star,
  FileCheck,
  Headphones,
  BadgeCheck,
  Briefcase
} from "lucide-react";


interface AboutPageProps {
  onNavigate: (page: string) => void;
}

const AboutPage = ({ onNavigate }: AboutPageProps) => {
  const professionalFeatures = [
    {
      icon: UserCheck,
      title: "Verified Teacher Profiles",
      description: "All educators undergo thorough verification to ensure they meet professional standards and have proven expertise in their subject areas."
    },
    {
      icon: BookOpen,
      title: "Course Creation Tools",
      description: "Educators can create, publish, and manage professional courses with our comprehensive content management system."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security with dual verification authentication, secure payment processing, and complete data protection."
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Track learner progress, course performance, and earnings with detailed analytics and reporting tools for educators."
    },
    {
      icon: Zap,
      title: "Flexible Subscription Plans",
      description: "Multiple tier options including Basic, Standard, and Premium memberships to match different needs and budgets."
    },
    {
      icon: BadgeCheck,
      title: "Quality Assurance",
      description: "All courses undergo review to maintain high educational standards and ensure quality learning experiences."
    }
  ];

  const platformCapabilities = [
    {
      icon: GraduationCap,
      title: "Extensive Course Catalog",
      description: "Thousands of professional courses created by expert educators across all academic subjects and skill levels"
    },
    {
      icon: FileCheck,
      title: "Teacher Enrollment System",
      description: "Streamlined application process for educators to join our platform and start teaching"
    },
    {
      icon: Headphones,
      title: "24/7 Platform Support",
      description: "Round-the-clock technical assistance for learners, teachers, and freelancers"
    },
    {
      icon: Lock,
      title: "Global Payment Processing",
      description: "Multiple secure payment options with trusted international payment processors for seamless global transactions"
    },
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Learners can study at their own pace with on-demand access to course materials anytime, anywhere"
    },
    {
      icon: Star,
      title: "Course Certification",
      description: "Earn certificates upon course completion to showcase achievements and skills"
    }
  ];

  const userBenefits = [
    {
      icon: BookOpen,
      title: "For Learners",
      description: "Access thousands of courses, track your progress, earn certificates, and learn from verified expert teachers across all subjects."
    },
    {
      icon: Users,
      title: "For Teachers",
      description: "Create and sell courses, build your professional reputation, manage learners, and earn income through the platform."
    },
    {
      icon: Briefcase,
      title: "For Freelancers",
      description: "Offer specialized courses, set your own pricing, reach a global audience, and grow your educational business."
    },
    {
      icon: Award,
      title: "Professional Growth",
      description: "Everyone benefits from our certification system, analytics tools, and supportive educational community."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence in Education",
      description: "We maintain the highest standards in content quality, instructor expertise, and platform performance."
    },
    {
      icon: Heart,
      title: "Learner Success First",
      description: "Every feature, policy, and decision is designed to maximize learning outcomes and satisfaction."
    },
    {
      icon: Lightbulb,
      title: "Innovation & Technology",
      description: "We continuously integrate cutting-edge educational technology to enhance the learning experience."
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "We evolve based on feedback, research, and emerging educational best practices."
    }
  ];

  const coreValues = [
    {
      title: "Educational Excellence",
      description: "We are committed to delivering the highest quality educational experiences through rigorous content standards and expert instruction."
    },
    {
      title: "Accessibility & Inclusion",
      description: "Quality education should be available to everyone, regardless of location, background, or circumstances."
    },
    {
      title: "Continuous Innovation",
      description: "We embrace cutting-edge technology and pedagogical research to constantly improve the learning experience."
    },
    {
      title: "Empowering Educators",
      description: "We provide teachers with the tools, support, and recognition they deserve to share their expertise with the world."
    },
    {
      title: "Learner-Centered Approach",
      description: "Every decision we make prioritizes learner success, engagement, and meaningful educational outcomes."
    },
    {
      title: "Trust & Security",
      description: "We maintain the highest standards of data protection, privacy, and platform reliability for all users."
    }
  ];

  const platformAdvantages = [
    {
      title: "Comprehensive Course Creation",
      description: "Our advanced course builder empowers educators to create engaging, multimedia-rich content with quizzes, assignments, video lessons, and interactive elements. Teachers can structure courses into organized modules and track engagement in real-time."
    },
    {
      title: "Learner-Centric Experience",
      description: "Benefit from personalized dashboards, progress tracking, achievement systems, and flexible learning schedules. Our platform adapts to individual learning styles while maintaining high educational standards across all courses."
    },
    {
      title: "Robust Analytics and Reporting",
      description: "Both educators and learners access detailed analytics including performance metrics, completion rates, time tracking, and revenue insights. Export comprehensive reports for professional development or institutional requirements."
    },
    {
      title: "Global Accessibility",
      description: "Built for international audiences with multi-currency support, localized content, and accessibility features. Our platform ensures education reaches learners regardless of location, device, or connectivity constraints."
    },
    {
      title: "Quality Assurance Process",
      description: "Every course undergoes rigorous review by our quality assurance team. We maintain educational standards through instructor verification, content reviews, feedback systems, and continuous improvement protocols."
    },
    {
      title: "Secure and Reliable Infrastructure",
      description: "Enterprise-grade security protects user data with encryption, secure authentication, and compliance with international data protection standards. Our platform maintains 99.9% uptime for uninterrupted learning."
    }
  ];

  const educationalApproach = [
    {
      icon: Target,
      title: "Competency-Based Learning",
      description: "Focus on mastery of skills and knowledge rather than time spent. Learners progress when they demonstrate understanding."
    },
    {
      icon: Users,
      title: "Collaborative Education",
      description: "Foster connections between learners and educators through discussion forums, peer reviews, and community engagement."
    },
    {
      icon: BarChart,
      title: "Data-Driven Insights",
      description: "Leverage analytics to identify learning patterns, optimize course effectiveness, and personalize educational paths."
    },
    {
      icon: Globe,
      title: "Culturally Inclusive",
      description: "Respect diverse perspectives and learning traditions from our global community of learners and educators."
    }
  ];


  return (
    <div className="min-h-screen flex flex-col pt-16 bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-[#ff5834]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-96 h-96 bg-[#c5f13c] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#c5f13c] rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white max-w-4xl mx-auto leading-tight" data-testid="heading-hero">
              Transforming Education Through <span className="text-[#c5f13c]">Excellence</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              EduFiliova connects passionate learners with expert educators worldwide, 
              offering a comprehensive platform for quality education, professional development, and lifelong learning.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm border-2 border-[#c5f13c] rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
                <p className="text-white font-semibold">For Learners</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border-2 border-[#c5f13c] rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
                <p className="text-white font-semibold">For Teachers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border-2 border-[#c5f13c] rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
                <p className="text-white font-semibold">For Freelancers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Card className="bg-[#ff5834] text-white border-0 shadow-lg" data-testid="card-mission">
                  <CardHeader>
                    <div className="mb-4">
                      <Target className="h-12 w-12 text-[#c5f13c]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white border-b-2 border-[#c5f13c] pb-2">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/95 leading-relaxed text-base">
                      To democratize access to world-class education by connecting learners with expert teachers 
                      and providing personalized learning experiences. We empower people globally to achieve 
                      academic excellence through innovative, accessible, and engaging educational solutions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#ff5834] text-white border-0 shadow-lg" data-testid="card-vision">
                  <CardHeader>
                    <div className="mb-4">
                      <Lightbulb className="h-12 w-12 text-[#c5f13c]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white border-b-2 border-[#c5f13c] pb-2">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/95 leading-relaxed text-base">
                      To be the world's most trusted educational platform, where every learner has access 
                      to personalized learning paths, expert teachers, and cutting-edge tools that unlock 
                      their full potential and prepare them for success in an ever-evolving global landscape.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Features */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-features">
                Professional-Grade Features
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Enterprise-level technology and expert resources designed for serious learners
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {professionalFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 border-[#ff5834] hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300 group" 
                  data-testid={`card-feature-${index}`}
                >
                  <CardHeader>
                    <div className="mb-4">
                      <feature.icon className="h-12 w-12 text-[#ff5834] group-hover:text-[#c5f13c] transition-colors" />
                    </div>
                    <CardTitle className="text-xl font-bold text-[#ff5834]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Capabilities */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-capabilities">
                Comprehensive Platform Capabilities
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Everything you need for a complete online learning experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {platformCapabilities.map((capability, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-6 bg-white border-2 border-[#ff5834] rounded-lg hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300"
                  data-testid={`capability-${index}`}
                >
                  <div className="flex-shrink-0">
                    <capability.icon className="h-10 w-10 text-[#ff5834]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-[#ff5834]">{capability.title}</h3>
                    <p className="text-muted-foreground text-sm">{capability.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-values">
                Our Core Values
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide every decision and action at EduFiliova
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 border-[#ff5834] hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300 text-center group"
                  data-testid={`card-value-${index}`}
                >
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      <value.icon className="h-12 w-12 text-[#ff5834] group-hover:text-[#c5f13c] transition-colors mx-auto" />
                    </div>
                    <CardTitle className="text-lg font-bold text-[#ff5834]">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* User Benefits */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-benefits">
                Built for Everyone in Education
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're learning, teaching, or running an educational business, EduFiliova provides the tools you need
              </p>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {userBenefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 border-[#ff5834] hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300"
                  data-testid={`benefit-${index}`}
                >
                  <CardHeader>
                    <div className="mb-4">
                      <benefit.icon className="h-12 w-12 text-[#ff5834]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-[#ff5834]">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-base leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Excellence */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-impact">
                Educational Excellence
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Committed to delivering outstanding learning experiences through quality, innovation, and dedication
              </p>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((item, index) => (
                <div 
                  key={index} 
                  className="p-8 bg-white border-2 border-[#ff5834] rounded-xl hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300"
                  data-testid={`impact-${index}`}
                >
                  <div className="text-xl font-bold text-[#ff5834] mb-3 border-b-2 border-[#c5f13c] pb-2">{item.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Advantages */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-advantages">
                Platform Advantages
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover what makes EduFiliova the preferred choice for professional education
              </p>
            </div>
            <div className="max-w-5xl mx-auto space-y-8">
              {platformAdvantages.map((advantage, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 border-[#ff5834] hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300"
                  data-testid={`advantage-${index}`}
                >
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-[#ff5834] border-b-2 border-[#c5f13c] pb-2 inline-block">{advantage.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base mt-4">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Approach */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]" data-testid="heading-approach">
                Our Educational Approach
              </h2>
              <div className="w-24 h-1 bg-[#c5f13c] mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Modern pedagogical principles that drive effective learning outcomes
              </p>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {educationalApproach.map((approach, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 border-[#ff5834] hover:border-[#c5f13c] hover:shadow-lg transition-all duration-300"
                  data-testid={`approach-${index}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-shrink-0">
                        <approach.icon className="h-12 w-12 text-[#ff5834]" />
                      </div>
                      <CardTitle className="text-xl text-[#ff5834]">{approach.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-base leading-relaxed">
                      {approach.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white border-4 border-[#ff5834] shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl md:text-4xl font-bold mb-4 text-[#ff5834]">
                    Our Commitment to Educational Excellence
                  </CardTitle>
                  <div className="w-24 h-1 bg-[#c5f13c] mx-auto"></div>
                </CardHeader>
                <CardContent className="space-y-6 text-base leading-relaxed text-muted-foreground">
                  <p>
                    At EduFiliova, we believe education is the foundation of personal and professional success. 
                    Our platform is built on the principle that quality education should be accessible to everyone, 
                    regardless of geographic location, economic background, or learning style.
                  </p>
                  <p>
                    We are committed to maintaining the highest standards of educational quality through rigorous 
                    instructor verification, comprehensive course reviews, and continuous platform improvements. 
                    Every teacher undergoes thorough background checks and credential verification to ensure 
                    learners benefit from qualified professionals.
                  </p>
                  <p>
                    Our technology infrastructure is designed for reliability, security, and scalability. We invest 
                    heavily in platform development, cybersecurity measures, and user experience optimization to 
                    provide a seamless educational environment for all users.
                  </p>
                  <p>
                    For teachers and freelancers, we provide the tools and support needed to build successful 
                    educational businesses. From comprehensive analytics to secure payment processing, we handle 
                    the technical complexities so educators can focus on what they do best - teaching.
                  </p>
                  <p className="font-semibold text-[#ff5834] text-lg">
                    Whether you're seeking knowledge, sharing expertise, or building an educational business, 
                    EduFiliova provides the professional platform you need to succeed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#ff5834] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#c5f13c] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#c5f13c] rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="heading-cta">
              Ready to Transform Your <span className="text-[#c5f13c]">Learning Journey</span>?
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful educators and learners worldwide who trust EduFiliova's 
              professional marketplace. Start your educational journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate("course-browse")}
                className="bg-[#c5f13c] text-[#ff5834] hover:bg-[#c5f13c]/90 hover:scale-105 text-lg px-8 py-6 transition-all duration-300 font-bold"
                data-testid="button-start-learning"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate("contact")}
                className="border-2 border-[#c5f13c] text-[#c5f13c] hover:bg-[#c5f13c] hover:text-[#ff5834] hover:scale-105 text-lg px-8 py-6 bg-transparent transition-all duration-300 font-bold"
                data-testid="button-contact"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckmarkIcon size="md" className="bg-[#c5f13c]" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckmarkIcon size="md" className="bg-[#c5f13c]" />
                <span>Free Trial Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckmarkIcon size="md" className="bg-[#c5f13c]" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AboutPage;
