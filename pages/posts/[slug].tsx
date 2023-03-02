import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps, NextApiRequest } from 'next'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import MoreStories from '../../components/more-stories'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import SectionSeparator from '../../components/section-separator'
import Layout from '../../components/layout'
import PostTitle from '../../components/post-title'
import Tags from '../../components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../lib/api'
import { CMS_NAME, CMS_URL, REDIRECT_ENABLE } from '../../lib/constants'
import React, { Component, useEffect } from "react";

export default function Post({ post, posts, preview }) {
  const router = useRouter()
  const morePosts = posts?.edges
  var _description = "";
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  //Check site from Facebook
  ///window.location.assign('https://duckduckgo.com/');

  if(post?.excerpt){
    const regex = /(<([^>]+)>)/ig;
    _description = post.excerpt.replace(regex, '');
  }

  // useEffect(() => {
  //   if(post?.slug && document.referrer.indexOf('facebook.com') >= 0){
  //     const target_url = router.asPath.replace("/posts/", "");
  //     window.location.href = CMS_URL+target_url;
  //     return;
  //   }else{
  //     console.log('Stay on vercel: ', CMS_URL+router.asPath.replace("/posts/", ""));
  //     return ;
  //   }
    
  // }, []);
  // if (typeof window !== "undefined") {
  //   // Client-side-only code
  //   if(post?.slug && window.document.referrer.indexOf('facebook.com') >= 0){
  //     const target_url = router.asPath.replace("/posts/", "");
  //     window.location.href = CMS_URL+target_url;
  //   }else{
  //     console.log('Stay on vercel: ', CMS_URL+router.asPath.replace("/posts/", ""), window.document.referrer);
  //   }
  // }
  
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>
                  {post.title} | {CMS_NAME}
                </title>
                <meta
                  property="og:image"
                  content={post.featuredImage?.node.sourceUrl}
                />
                <meta
                  name="description"
                  content={`${_description}.`}
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
              />
              <PostBody content={post.content} />
              <footer>
                {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
              </footer>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
        )}
      </Container>
    </Layout>
  )
}


export async function getServerSideProps({
  params,
  preview = false,
  previewData,
  req
}) {
  const _referer = req?.headers?.referer
  console.log('REFERER:', _referer);
  if(REDIRECT_ENABLE && _referer && _referer.indexOf('facebook.com') > -1){
    //redirect
    return {
          redirect: {
            destination: CMS_URL+`/`+params?.slug+'.html', // Matched parameters can be used in the destination
            permanent: false,
          },
        }
  }else{
    const data = await getPostAndMorePosts(params?.slug, preview, previewData)
    return {
      props: {
        preview,
        post: data.post,
        posts: data.posts,
      },
    }
  }
}