// Import hero images and profile avatars
import creativeImg from '@assets/generated_images/Modern_freelancer_workspace_background_30112dbd.png';
import profile1 from '@assets/generated_images/Female_freelancer_headshot_23df22bc.png';
import profile2 from '@assets/generated_images/Male_freelancer_headshot_e41c1a56.png';
import profile3 from '@assets/generated_images/Mature_female_freelancer_headshot_1046ea13.png';
import profile4 from '@assets/generated_images/Creative_male_freelancer_headshot_3f2fbe8e.png';
import profile5 from '@assets/generated_images/Young_businessman_professional_headshot_76a308f7.png';
import profile6 from '@assets/generated_images/Young_businesswoman_professional_headshot_43cbcb58.png';

export interface AuthHeroConfig {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  profileImages?: string[];
  showRating?: boolean;
  rating?: number;
  testimonial?: string;
}

export const authHeroConfigs = {
  student: {
    title: 'Welcome back to\nEduFiliova.',
    subtitle: 'Sign in to continue your learning journey.',
    backgroundImage: creativeImg,
    profileImages: [profile1, profile2, profile3, profile4],
    showRating: true,
    rating: 5.0,
    testimonial: 'The platform that helped me excel in my studies and connect with amazing teachers.'
  } as AuthHeroConfig,

  teacher: {
    title: 'Welcome back,\nEducator.',
    subtitle: 'Continue inspiring students and managing your classes.',
    backgroundImage: creativeImg,
    profileImages: [profile5, profile6, profile1, profile2],
    showRating: true,
    rating: 4.9,
    testimonial: 'Teaching here has been incredibly rewarding. The tools make everything so much easier.'
  } as AuthHeroConfig,

  freelancer: {
    title: 'Join thousands of\ncreators making money.',
    subtitle: 'Start your freelancing journey today.',
    backgroundImage: creativeImg,
    profileImages: [profile1, profile2, profile3, profile4, profile5, profile6],
    showRating: true,
    rating: 5.0,
    testimonial: 'I\'ve built an amazing client base and grown my business through this platform.'
  } as AuthHeroConfig,

  general: {
    title: 'Welcome to\nEduFiliova.',
    subtitle: 'Your gateway to learning, teaching, and creating.',
    backgroundImage: creativeImg,
    profileImages: [profile1, profile2, profile3, profile4],
    showRating: true,
    rating: 5.0,
    testimonial: 'A platform that brings together learners and educators from around the world.'
  } as AuthHeroConfig
};

export default authHeroConfigs;
