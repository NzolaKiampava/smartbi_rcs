import Avatar from './Avatar';

export default { title: 'UI/Avatar', component: Avatar };

export const Default = () => <Avatar name="John Doe" />;
export const WithImage = () => <Avatar src="/public/Generated_Image_September_10__2025_-_4_30PM-removebg-preview.png" name="Jane" />;
