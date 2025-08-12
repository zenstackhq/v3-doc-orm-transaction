import { createClient } from './db';

async function main() {
  const db = await createClient();

  console.log('Create two users with a sequential transaction');
  const users = await db.$transaction([
    db.user.create({ data: { email: 'u1@test.com' } }),
    db.user.create({ data: { email: 'u2@test.com' } }),
  ]);
  console.log(users);

  console.log('Create two users with unique constraint violation');
  try {
    await db.$transaction([
      db.user.create({ data: { email: 'u3@test.com' } }),
      db.user.create({ data: { email: 'u3@test.com' } }),
      ]
    );
  } catch (err: any) {
    console.log('Transaction rolled back due to:', err.cause.message);
    console.log('User created:', await db.user.findUnique({where: { email: 'u3@test.com' } }));
  }

  console.log('Create user and post with an interactive transaction');
  const [user, post] = await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email: 'u3@test.com' } });
    const post = await tx.post.create({ data: { title: 'Post1', authorId: user.id } });
    return [user, post];
  });
  console.log('Created user and post:', user, post);
}

main();
