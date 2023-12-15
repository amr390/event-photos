interface Props {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
}
const ProfileHeader = (props: Props) => {
  return (
    <div>
      <h1>header</h1>
    </div>
  );
};

export default ProfileHeader;
